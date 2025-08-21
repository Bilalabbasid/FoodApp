import express from 'express';
import { body, param, query } from 'express-validator';
import { Order } from '../models/Order.js';
import { Store } from '../models/Store.js';
import { User } from '../models/User.js';
import { PricingCalculator } from '../utils/pricing.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { orderLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Create order
router.post('/',
  orderLimiter,
  optionalAuth,
  [
    body('storeId').isString().withMessage('Store ID required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('deliveryMethod').isIn(['pickup', 'delivery']).withMessage('Valid delivery method required'),
    body('guestContact.name').if(body('userId').not().exists()).notEmpty().withMessage('Guest name required'),
    body('guestContact.email').if(body('userId').not().exists()).isEmail().withMessage('Guest email required'),
    body('guestContact.phone').if(body('userId').not().exists()).isMobilePhone('any').withMessage('Guest phone required')
  ],
  validate,
  async (req: any, res) => {
    try {
      const { storeId, items, deliveryMethod, deliveryAddress, guestContact, couponCode, tip = 0 } = req.body;
      const userId = req.user?._id;

      // Find store by slug or ID
      const store = await Store.findOne({
        $or: [{ slug: storeId }, { _id: storeId }]
      });
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      // Calculate final pricing
      const pricing = await PricingCalculator.calculateCart(items, {
        storeId: store._id.toString(),
        deliveryMethod,
        deliveryZoneId: deliveryMethod === 'delivery' ? store.deliveryZones[0]?._id?.toString() : undefined,
        couponCode,
        userId,
        zipCode: deliveryAddress?.zipCode
      });

      // Add tip to total
      pricing.tip = tip;
      pricing.total += tip;

      // Create order
      const orderData: any = {
        userId,
        guestContact: !userId ? guestContact : undefined,
        storeId: store._id,
        items: pricing.items,
        pricing,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
        status: 'pending',
        timeline: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Order placed'
        }]
      };

      const order = new Order(orderData);
      await order.save();

      // Populate order details
      await order.populate('storeId', 'name address phone');
      
      // Emit real-time update
      const io = (global as any).io;
      if (io) {
        io.to(`store-${store._id}`).emit('newOrder', order);
      }

      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }
  }
);

// Get order by order number
router.get('/:orderNo',
  param('orderNo').matches(/^ORD-\d{6}$/).withMessage('Valid order number required'),
  validate,
  async (req, res) => {
    try {
      const order = await Order.findOne({ orderNo: req.params.orderNo })
        .populate('storeId', 'name address phone');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  }
);

// Get user orders
router.get('/user/history',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
  ],
  validate,
  async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const orders = await Order.find({ userId: req.user._id })
        .populate('storeId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments({ userId: req.user._id });

      res.json({
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }
);

// Update order status (admin/staff only)
router.patch('/:orderId/status',
  authenticate,
  authorize('staff', 'manager', 'admin'),
  [
    param('orderId').isMongoId().withMessage('Valid order ID required'),
    body('status').isIn(['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled']).withMessage('Valid status required'),
    body('note').optional().isString().withMessage('Note must be a string')
  ],
  validate,
  async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { status, note } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update status and timeline
      order.status = status;
      order.timeline.push({
        status,
        timestamp: new Date(),
        note,
        updatedBy: req.user._id
      });

      // Set ready time for certain statuses
      if (status === 'ready' && !order.actualReadyTime) {
        order.actualReadyTime = new Date();
      }

      await order.save();

      // Emit real-time updates
      const io = (global as any).io;
      if (io) {
        io.to(`order-${order.orderNo}`).emit('orderStatusUpdate', { 
          status, 
          timestamp: new Date(),
          order 
        });
        io.to(`store-${order.storeId}`).emit('orderUpdate', order);
      }

      res.json({
        success: true,
        data: order,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  }
);

export default router;