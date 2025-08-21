import express from 'express';
import { body, param, query } from 'express-validator';
import { Store } from '../models/Store.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication and authorization to all admin routes
router.use(authenticate);
router.use(authorize('admin', 'manager'));

// Dashboard analytics
router.get('/analytics', async (req, res) => {
  try {
    const { from, to, storeId } = req.query;
    
    const dateFilter: any = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from as string);
      if (to) dateFilter.createdAt.$lte = new Date(to as string);
    } else {
      // Default to last 30 days
      dateFilter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    const orderFilter = { ...dateFilter };
    if (storeId) orderFilter.storeId = storeId;

    // Get key metrics
    const [
      totalOrders,
      totalRevenue,
      avgOrderValue,
      topItems,
      ordersByStatus,
      ordersByDay
    ] = await Promise.all([
      Order.countDocuments(orderFilter),
      Order.aggregate([
        { $match: orderFilter },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.aggregate([
        { $match: orderFilter },
        { $group: { _id: null, avg: { $avg: '$pricing.total' } } }
      ]),
      Order.aggregate([
        { $match: orderFilter },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', count: { $sum: '$items.quantity' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Order.aggregate([
        { $match: orderFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: orderFilter },
        { $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        avgOrderValue: avgOrderValue[0]?.avg || 0,
        topItems,
        ordersByStatus,
        ordersByDay
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Get all orders with filters
router.get('/orders',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('status').optional().isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled', 'refunded']),
    query('storeId').optional().isMongoId().withMessage('Valid store ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.storeId) filter.storeId = req.query.storeId;
      if (req.query.from || req.query.to) {
        filter.createdAt = {};
        if (req.query.from) filter.createdAt.$gte = new Date(req.query.from as string);
        if (req.query.to) filter.createdAt.$lte = new Date(req.query.to as string);
      }

      const orders = await Order.find(filter)
        .populate('storeId', 'name')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(filter);

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
      console.error('Get admin orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }
);

// Create/Update menu item
router.post('/items',
  [
    body('storeId').isMongoId().withMessage('Valid store ID required'),
    body('categoryId').isMongoId().withMessage('Valid category ID required'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description required'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be positive')
  ],
  validate,
  async (req, res) => {
    try {
      const itemData = req.body;
      
      // Generate slug from name
      itemData.slug = itemData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const item = new Item(itemData);
      await item.save();

      res.status(201).json({
        success: true,
        data: item,
        message: 'Item created successfully'
      });
    } catch (error) {
      console.error('Create item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create item'
      });
    }
  }
);

// Update item
router.patch('/items/:itemId',
  [
    param('itemId').isMongoId().withMessage('Valid item ID required'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description required'),
    body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be positive')
  ],
  validate,
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const updateData = req.body;

      // If name is being updated, regenerate slug
      if (updateData.name) {
        updateData.slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const item = await Item.findByIdAndUpdate(
        itemId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).populate('categoryId', 'name')
        .populate('storeId', 'name');

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      res.json({
        success: true,
        data: item,
        message: 'Item updated successfully'
      });
    } catch (error) {
      console.error('Update item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update item'
      });
    }
  }
);

// Delete item
router.delete('/items/:itemId',
  [
    param('itemId').isMongoId().withMessage('Valid item ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { itemId } = req.params;

      const item = await Item.findByIdAndDelete(itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      res.json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      console.error('Delete item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete item'
      });
    }
  }
);

// Update item availability
router.patch('/items/:itemId/availability',
  [
    param('itemId').isMongoId().withMessage('Valid item ID required'),
    body('isAvailable').isBoolean().withMessage('Availability must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const { isAvailable } = req.body;

      const item = await Item.findByIdAndUpdate(
        itemId,
        { isAvailable },
        { new: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      res.json({
        success: true,
        data: item,
        message: 'Item availability updated'
      });
    } catch (error) {
      console.error('Update item availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update item availability'
      });
    }
  }
);

// Create coupon
router.post('/coupons',
  [
    body('code').trim().isLength({ min: 3, max: 20 }).withMessage('Code must be 3-20 characters'),
    body('type').isIn(['percent', 'fixed']).withMessage('Type must be percent or fixed'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be positive'),
    body('startsAt').isISO8601().withMessage('Valid start date required'),
    body('endsAt').isISO8601().withMessage('Valid end date required')
  ],
  validate,
  async (req, res) => {
    try {
      const couponData = req.body;
      couponData.code = couponData.code.toUpperCase();
      
      const coupon = new Coupon(couponData);
      await coupon.save();

      res.status(201).json({
        success: true,
        data: coupon,
        message: 'Coupon created successfully'
      });
    } catch (error) {
      console.error('Create coupon error:', error);
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create coupon'
      });
    }
  }
);

export default router;