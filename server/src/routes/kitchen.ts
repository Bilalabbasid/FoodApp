import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Kitchen staff can only access kitchen-related endpoints
// We'll add role-based filtering in each endpoint

// Get kitchen orders (kitchen staff, manager, admin)
router.get('/orders',
  authorize('staff', 'manager', 'admin'),
  [
    query('status').optional().isIn(['confirmed', 'preparing', 'ready']).withMessage('Invalid status for kitchen'),
    query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
  ],
  validate,
  async (req, res) => {
    try {
      const { status, priority, limit = 50 } = req.query;

      // Filter for kitchen-relevant orders
      const filter: Record<string, any> = {
        status: { $in: ['confirmed', 'preparing', 'ready'] }
      };

      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      // Mock kitchen orders data
      const kitchenOrders = [
        {
          _id: '1',
          orderNo: 'ORD-000001',
          status: 'confirmed',
          priority: 'normal',
          items: [
            {
              name: 'Margherita Pizza',
              quantity: 2,
              selectedVariant: { name: 'Large' },
              selectedAddons: [{ name: 'Extra Cheese' }],
              specialInstructions: 'Extra crispy'
            },
            {
              name: 'Caesar Salad',
              quantity: 1,
              selectedAddons: [{ name: 'Grilled Chicken' }]
            }
          ],
          specialInstructions: 'Customer allergic to nuts',
          estimatedPrepTime: 25,
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          estimatedReadyTime: new Date(Date.now() + 20 * 60 * 1000),
          deliveryMethod: 'delivery',
          storeId: 'store1'
        },
        {
          _id: '2',
          orderNo: 'ORD-000002',
          status: 'preparing',
          priority: 'high',
          items: [
            {
              name: 'Chicken Burger',
              quantity: 3,
              selectedAddons: [{ name: 'Bacon' }, { name: 'Avocado' }]
            }
          ],
          estimatedPrepTime: 15,
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
          estimatedReadyTime: new Date(Date.now() + 5 * 60 * 1000),
          deliveryMethod: 'pickup',
          storeId: 'store1'
        }
      ];

      // Apply status filter
      const filteredOrders = status 
        ? kitchenOrders.filter(order => order.status === status)
        : kitchenOrders;

      res.json({
        success: true,
        data: filteredOrders.slice(0, parseInt(limit as string)),
        meta: {
          total: filteredOrders.length,
          pending: kitchenOrders.filter(o => o.status === 'confirmed').length,
          preparing: kitchenOrders.filter(o => o.status === 'preparing').length,
          ready: kitchenOrders.filter(o => o.status === 'ready').length
        }
      });
    } catch (error) {
      console.error('Get kitchen orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch kitchen orders'
      });
    }
  }
);

// Update order status (kitchen staff, manager, admin)
router.patch('/orders/:orderId/status',
  authorize('staff', 'manager', 'admin'),
  [
    param('orderId').isMongoId().withMessage('Valid order ID required'),
    body('status').isIn(['preparing', 'ready']).withMessage('Kitchen can only set preparing or ready status'),
    body('estimatedReadyTime').optional().isISO8601().withMessage('Valid estimated ready time required'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes max 500 characters')
  ],
  validate,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, estimatedReadyTime, notes } = req.body;

      // In real implementation, update order in database
      const updatedOrder = {
        _id: orderId,
        status,
        estimatedReadyTime: estimatedReadyTime ? new Date(estimatedReadyTime) : undefined,
        kitchenNotes: notes,
        updatedAt: new Date(),
        updatedBy: req.user._id
      };

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('orderStatusUpdate', {
          orderId,
          status,
          estimatedReadyTime,
          kitchenNotes: notes,
          timestamp: new Date()
        });

        // Notify admin dashboard
        io.to('admin').emit('kitchenOrderUpdate', updatedOrder);
        
        // Notify customer
        io.to(`order_${orderId}`).emit('orderUpdate', {
          status,
          message: status === 'preparing' ? 'Your order is being prepared' : 'Your order is ready!',
          estimatedReadyTime
        });
      }

      res.json({
        success: true,
        data: updatedOrder,
        message: `Order status updated to ${status}`
      });
    } catch (error) {
      console.error('Update kitchen order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status'
      });
    }
  }
);

// Get kitchen performance metrics (manager, admin)
router.get('/metrics',
  authorize('manager', 'admin'),
  [
    query('from').optional().isISO8601().withMessage('Valid from date required'),
    query('to').optional().isISO8601().withMessage('Valid to date required'),
    query('storeId').optional().isMongoId().withMessage('Valid store ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { from, to, storeId } = req.query;

      // Mock kitchen metrics
      const metrics = {
        averagePrepTime: 18, // minutes
        totalOrdersPrepared: 156,
        onTimeDeliveryRate: 92.5, // percentage
        activeOrders: {
          confirmed: 5,
          preparing: 8,
          ready: 3
        },
        staffPerformance: [
          {
            staffId: 'staff1',
            name: 'John Kitchen',
            ordersPrepared: 45,
            averagePrepTime: 16,
            rating: 4.8
          },
          {
            staffId: 'staff2',
            name: 'Maria Chef',
            ordersPrepared: 52,
            averagePrepTime: 14,
            rating: 4.9
          }
        ],
        hourlyVolume: [
          { hour: 8, orders: 12 },
          { hour: 9, orders: 18 },
          { hour: 10, orders: 25 },
          { hour: 11, orders: 35 },
          { hour: 12, orders: 45 },
          { hour: 13, orders: 38 },
          { hour: 14, orders: 28 }
        ],
        popularItems: [
          { name: 'Margherita Pizza', count: 34, avgPrepTime: 22 },
          { name: 'Chicken Burger', count: 28, avgPrepTime: 15 },
          { name: 'Caesar Salad', count: 21, avgPrepTime: 8 }
        ]
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Get kitchen metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch kitchen metrics'
      });
    }
  }
);

// Update item preparation time (kitchen staff, manager, admin)
router.patch('/items/:itemId/prep-time',
  authorize('staff', 'manager', 'admin'),
  [
    param('itemId').isMongoId().withMessage('Valid item ID required'),
    body('preparationTime').isInt({ min: 1, max: 120 }).withMessage('Preparation time must be 1-120 minutes')
  ],
  validate,
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const { preparationTime } = req.body;

      // In real implementation, update item preparation time in database
      const updatedItem = {
        _id: itemId,
        preparationTime,
        updatedAt: new Date(),
        updatedBy: req.user._id
      };

      res.json({
        success: true,
        data: updatedItem,
        message: 'Item preparation time updated'
      });
    } catch (error) {
      console.error('Update prep time error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preparation time'
      });
    }
  }
);

// Mark ingredient as out of stock (kitchen staff, manager, admin)
router.patch('/items/:itemId/stock',
  authorize('staff', 'manager', 'admin'),
  [
    param('itemId').isMongoId().withMessage('Valid item ID required'),
    body('isAvailable').isBoolean().withMessage('Availability status required'),
    body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason max 200 characters')
  ],
  validate,
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const { isAvailable, reason } = req.body;

      // In real implementation, update item availability in database
      const updatedItem = {
        _id: itemId,
        isAvailable,
        stockReason: reason,
        updatedAt: new Date(),
        updatedBy: req.user._id
      };

      // Emit real-time update to all clients
      const io = req.app.get('io');
      if (io) {
        io.emit('itemAvailabilityUpdate', {
          itemId,
          isAvailable,
          reason
        });
      }

      res.json({
        success: true,
        data: updatedItem,
        message: `Item marked as ${isAvailable ? 'available' : 'unavailable'}`
      });
    } catch (error) {
      console.error('Update item stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update item availability'
      });
    }
  }
);

// Get kitchen staff shift information (staff can view own, manager/admin can view all)
router.get('/staff/shifts',
  [
    query('staffId').optional().isMongoId().withMessage('Valid staff ID required'),
    query('date').optional().isISO8601().withMessage('Valid date required')
  ],
  validate,
  async (req, res) => {
    try {
      const { staffId, date } = req.query;
      const requestingUserId = req.user._id;
      const requestingUserRole = req.user.role;

      // Staff can only view their own shifts unless manager/admin
      if (staffId && staffId !== requestingUserId && !['manager', 'admin'].includes(requestingUserRole)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view other staff shifts'
        });
      }

      const targetStaffId = staffId || requestingUserId;

      // Mock shift data
      const shifts = [
        {
          _id: 'shift1',
          staffId: targetStaffId,
          staffName: 'John Kitchen',
          date: date || new Date().toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '16:00',
          status: 'active',
          ordersHandled: 23,
          performance: {
            averagePrepTime: 16,
            accuracy: 98.5,
            customerRating: 4.7
          }
        }
      ];

      res.json({
        success: true,
        data: shifts
      });
    } catch (error) {
      console.error('Get staff shifts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch staff shifts'
      });
    }
  }
);

// Clock in/out for kitchen staff
router.post('/staff/clock',
  authorize('staff', 'manager', 'admin'),
  [
    body('action').isIn(['in', 'out']).withMessage('Action must be in or out'),
    body('notes').optional().trim().isLength({ max: 200 }).withMessage('Notes max 200 characters')
  ],
  validate,
  async (req, res) => {
    try {
      const { action, notes } = req.body;
      const staffId = req.user._id;

      // In real implementation, record clock in/out time
      const clockRecord = {
        _id: Math.random().toString(36).substr(2, 9),
        staffId,
        action,
        timestamp: new Date(),
        notes,
        location: 'Kitchen' // Could be determined by IP or device
      };

      // Notify managers of clock in/out
      const io = req.app.get('io');
      if (io) {
        io.to('managers').emit('staffClockUpdate', {
          staffId,
          staffName: req.user.name,
          action,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: clockRecord,
        message: `Successfully clocked ${action}`
      });
    } catch (error) {
      console.error('Clock in/out error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record clock time'
      });
    }
  }
);

// Report kitchen issue (staff, manager, admin)
router.post('/issues',
  authorize('staff', 'manager', 'admin'),
  [
    body('type').isIn(['equipment', 'supply', 'safety', 'other']).withMessage('Invalid issue type'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
    body('equipment').optional().trim().isLength({ max: 100 }).withMessage('Equipment name max 100 characters')
  ],
  validate,
  async (req, res) => {
    try {
      const { type, priority, description, equipment } = req.body;
      const reportedBy = req.user._id;

      const issue = {
        _id: Math.random().toString(36).substr(2, 9),
        type,
        priority,
        description,
        equipment,
        reportedBy,
        reportedByName: req.user.name,
        status: 'open',
        createdAt: new Date()
      };

      // Notify managers immediately for high/urgent issues
      if (['high', 'urgent'].includes(priority)) {
        const io = req.app.get('io');
        if (io) {
          io.to('managers').emit('urgentKitchenIssue', issue);
        }
      }

      res.status(201).json({
        success: true,
        data: issue,
        message: 'Issue reported successfully'
      });
    } catch (error) {
      console.error('Report kitchen issue error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to report issue'
      });
    }
  }
);

export default router;
