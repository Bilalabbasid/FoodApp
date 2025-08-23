import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { Order } from '../models/Order.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Rider model would be defined similar to other models
interface Rider {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  vehicleType: 'bike' | 'scooter' | 'car';
  isOnline: boolean;
  lastActive: Date;
  currentOrder?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Assignment {
  _id: string;
  orderId: string;
  riderId: string;
  assignedAt: Date;
  status: 'assigned' | 'picked_up' | 'delivered';
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  distance: number;
  earnings: number;
}

// Get all riders (admin/manager only)
router.get('/',
  authorize('admin', 'manager'),
  [
    query('status').optional().isIn(['available', 'busy', 'offline']).withMessage('Invalid status'),
    query('vehicleType').optional().isIn(['bike', 'scooter', 'car']).withMessage('Invalid vehicle type'),
    query('isOnline').optional().isBoolean().withMessage('isOnline must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      // In real implementation, this would query the Rider model
      const mockRiders: Rider[] = [
        {
          _id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1234567890',
          status: 'available',
          currentLocation: {
            lat: 40.7128,
            lng: -74.0060,
            address: '5th Avenue, NYC'
          },
          rating: 4.8,
          totalDeliveries: 234,
          totalEarnings: 2840,
          vehicleType: 'bike',
          isOnline: true,
          lastActive: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1234567891',
          status: 'busy',
          currentLocation: {
            lat: 40.7589,
            lng: -73.9851,
            address: 'Central Park, NYC'
          },
          rating: 4.9,
          totalDeliveries: 189,
          totalEarnings: 2156,
          vehicleType: 'scooter',
          isOnline: true,
          lastActive: new Date(),
          currentOrder: 'ORD-000123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Apply filters
      let filteredRiders = mockRiders;
      
      if (req.query.status) {
        filteredRiders = filteredRiders.filter(rider => rider.status === req.query.status);
      }
      
      if (req.query.vehicleType) {
        filteredRiders = filteredRiders.filter(rider => rider.vehicleType === req.query.vehicleType);
      }
      
      if (req.query.isOnline !== undefined) {
        const isOnline = req.query.isOnline === 'true';
        filteredRiders = filteredRiders.filter(rider => rider.isOnline === isOnline);
      }

      res.json({
        success: true,
        data: filteredRiders
      });
    } catch (error) {
      console.error('Get riders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch riders'
      });
    }
  }
);

// Get available riders for order assignment
router.get('/available',
  authorize('admin', 'manager', 'staff'),
  async (req, res) => {
    try {
      // In real implementation, this would query riders with status 'available' and isOnline true
      const availableRiders = [
        {
          _id: '1',
          name: 'John Smith',
          vehicleType: 'bike',
          currentLocation: {
            lat: 40.7128,
            lng: -74.0060,
            address: '5th Avenue, NYC'
          },
          rating: 4.8,
          estimatedArrival: 8 // minutes
        }
      ];

      res.json({
        success: true,
        data: availableRiders
      });
    } catch (error) {
      console.error('Get available riders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available riders'
      });
    }
  }
);

// Assign order to rider
router.post('/assign',
  authorize('admin', 'manager', 'staff'),
  [
    body('orderId').isMongoId().withMessage('Valid order ID required'),
    body('riderId').isMongoId().withMessage('Valid rider ID required'),
    body('estimatedDeliveryTime').isISO8601().withMessage('Valid delivery time required')
  ],
  validate,
  async (req, res) => {
    try {
      const { orderId, riderId, estimatedDeliveryTime } = req.body;

      // Verify order exists and is ready for delivery
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (order.status !== 'ready') {
        return res.status(400).json({
          success: false,
          message: 'Order must be ready before assignment'
        });
      }

      // In real implementation, verify rider exists and is available
      // Create assignment record
      const assignment: Assignment = {
        _id: Math.random().toString(36).substr(2, 9),
        orderId,
        riderId,
        assignedAt: new Date(),
        status: 'assigned',
        estimatedDeliveryTime: new Date(estimatedDeliveryTime),
        distance: 2.5, // Would be calculated based on addresses
        earnings: 12.50 // Would be calculated based on distance/time
      };

      // Update order status
      await Order.findByIdAndUpdate(orderId, {
        status: 'out_for_delivery',
        assignedRider: riderId,
        estimatedDeliveryTime: new Date(estimatedDeliveryTime)
      });

      // In real implementation, update rider status to 'busy'
      // Send real-time notification to rider
      const io = req.app.get('io');
      if (io) {
        io.to(`rider_${riderId}`).emit('orderAssigned', {
          assignment,
          order: {
            orderNo: order.orderNo,
            customerAddress: order.deliveryAddress,
            items: order.items
          }
        });

        // Notify customer
        io.to(`order_${order.orderNo}`).emit('orderStatusUpdate', {
          status: 'out_for_delivery',
          riderId,
          estimatedDeliveryTime
        });
      }

      res.json({
        success: true,
        data: assignment,
        message: 'Order assigned successfully'
      });
    } catch (error) {
      console.error('Assign order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign order'
      });
    }
  }
);

// Update rider status
router.patch('/:riderId/status',
  authorize('admin', 'manager'),
  [
    param('riderId').isMongoId().withMessage('Valid rider ID required'),
    body('status').isIn(['available', 'busy', 'offline']).withMessage('Invalid status')
  ],
  validate,
  async (req, res) => {
    try {
      const { riderId } = req.params;
      const { status } = req.body;

      // In real implementation, update rider in database
      const updatedRider = {
        _id: riderId,
        status,
        lastActive: new Date(),
        updatedAt: new Date()
      };

      // Send real-time notification
      const io = req.app.get('io');
      if (io) {
        io.to(`rider_${riderId}`).emit('statusUpdate', { status });
      }

      res.json({
        success: true,
        data: updatedRider,
        message: 'Rider status updated'
      });
    } catch (error) {
      console.error('Update rider status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update rider status'
      });
    }
  }
);

// Update rider location (for rider app)
router.patch('/:riderId/location',
  [
    param('riderId').isMongoId().withMessage('Valid rider ID required'),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
    body('address').optional().trim().isLength({ min: 1 }).withMessage('Valid address required')
  ],
  validate,
  async (req, res) => {
    try {
      const { riderId } = req.params;
      const { lat, lng, address } = req.body;

      // Verify rider owns this account or is admin
      if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user._id !== riderId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this rider'
        });
      }

      // In real implementation, update rider location in database
      const location = { lat, lng, address };

      // If rider has current order, update tracking
      const io = req.app.get('io');
      if (io) {
        // Notify any tracking this rider's delivery
        io.emit('riderLocationUpdate', {
          riderId,
          location
        });
      }

      res.json({
        success: true,
        data: { location },
        message: 'Location updated'
      });
    } catch (error) {
      console.error('Update rider location error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update location'
      });
    }
  }
);

// Get rider assignments
router.get('/:riderId/assignments',
  [
    param('riderId').isMongoId().withMessage('Valid rider ID required'),
    query('status').optional().isIn(['assigned', 'picked_up', 'delivered']).withMessage('Invalid status'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
  ],
  validate,
  async (req, res) => {
    try {
      const { riderId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Verify rider owns this account or is admin/manager
      if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user._id !== riderId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these assignments'
        });
      }

      // In real implementation, query assignments from database
      const assignments: Assignment[] = [
        {
          _id: '1',
          orderId: 'order1',
          riderId,
          assignedAt: new Date(Date.now() - 30 * 60 * 1000),
          status: 'delivered',
          estimatedDeliveryTime: new Date(Date.now() - 15 * 60 * 1000),
          actualDeliveryTime: new Date(Date.now() - 10 * 60 * 1000),
          distance: 2.3,
          earnings: 12.50
        }
      ];

      res.json({
        success: true,
        data: assignments,
        pagination: {
          page,
          limit,
          total: assignments.length,
          totalPages: Math.ceil(assignments.length / limit)
        }
      });
    } catch (error) {
      console.error('Get rider assignments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments'
      });
    }
  }
);

// Update assignment status (for rider app)
router.patch('/assignments/:assignmentId/status',
  [
    param('assignmentId').isMongoId().withMessage('Valid assignment ID required'),
    body('status').isIn(['picked_up', 'delivered']).withMessage('Invalid status')
  ],
  validate,
  async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const { status } = req.body;

      // In real implementation, verify rider owns this assignment
      // Update assignment status
      const updatedAssignment = {
        _id: assignmentId,
        status,
        ...(status === 'delivered' && { actualDeliveryTime: new Date() })
      };

      // Update corresponding order status
      if (status === 'picked_up') {
        // Order status remains 'out_for_delivery'
      } else if (status === 'delivered') {
        // Update order to 'delivered'
        // In real implementation: await Order.findByIdAndUpdate(assignment.orderId, { status: 'delivered' });
      }

      // Send real-time notifications
      const io = req.app.get('io');
      if (io) {
        // Notify customer
        io.emit('deliveryStatusUpdate', {
          assignmentId,
          status,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: updatedAssignment,
        message: 'Assignment status updated'
      });
    } catch (error) {
      console.error('Update assignment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update assignment status'
      });
    }
  }
);

// Get rider analytics (for admin/manager)
router.get('/analytics/performance',
  authorize('admin', 'manager'),
  [
    query('from').optional().isISO8601().withMessage('Valid from date required'),
    query('to').optional().isISO8601().withMessage('Valid to date required'),
    query('riderId').optional().isMongoId().withMessage('Valid rider ID required')
  ],
  validate,
  async (req, res) => {
    try {
      // In real implementation, this would aggregate data from assignments and orders
      const analytics = {
        totalRiders: 3,
        activeRiders: 2,
        avgDeliveryTime: 18, // minutes
        avgRating: 4.8,
        totalDeliveries: 521,
        totalEarnings: 6200,
        topPerformers: [
          { riderId: '2', name: 'Sarah Johnson', deliveries: 189, rating: 4.9, earnings: 2156 },
          { riderId: '1', name: 'John Smith', deliveries: 234, rating: 4.8, earnings: 2840 }
        ]
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get rider analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics'
      });
    }
  }
);

export default router;
