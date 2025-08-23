import express from 'express';
import { body, param, query } from 'express-validator';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get user profile (own profile or admin can view any)
router.get('/profile/:userId?',
  [
    param('userId').optional().isMongoId().withMessage('Valid user ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user._id;
      const requestingUserRole = req.user.role;

      let targetUserId = userId || requestingUserId;

      // Check permissions: users can only view their own profile unless admin/manager
      if (targetUserId !== requestingUserId && !['admin', 'manager'].includes(requestingUserRole)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this profile'
        });
      }

      const user = await User.findById(targetUserId).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }
);

// Update user profile (own profile only, unless admin)
router.patch('/profile/:userId?',
  [
    param('userId').optional().isMongoId().withMessage('Valid user ID required'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('phone').optional().trim().matches(/^\+?[\d\s\-\(\)]{10,}$/).withMessage('Valid phone number required'),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date required'),
    body('preferences').optional().isObject().withMessage('Preferences must be object')
  ],
  validate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user._id;
      const requestingUserRole = req.user.role;
      const updateData = req.body;

      let targetUserId = userId || requestingUserId;

      // Check permissions
      if (targetUserId !== requestingUserId && !['admin', 'manager'].includes(requestingUserRole)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this profile'
        });
      }

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.email;
      delete updateData.password;
      delete updateData.role;
      delete updateData.isVerified;

      const user = await User.findByIdAndUpdate(
        targetUserId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
);

// Get user orders (own orders only, unless admin/manager)
router.get('/orders/:userId?',
  [
    param('userId').optional().isMongoId().withMessage('Valid user ID required'),
    query('status').optional().isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled', 'refunded']),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
  ],
  validate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user._id;
      const requestingUserRole = req.user.role;
      const { status, page = 1, limit = 10 } = req.query;

      let targetUserId = userId || requestingUserId;

      // Check permissions
      if (targetUserId !== requestingUserId && !['admin', 'manager'].includes(requestingUserRole)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these orders'
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const filter: Record<string, any> = { userId: targetUserId };
      if (status) filter.status = status;

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('storeId', 'name address')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Order.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
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

// Get user addresses (own addresses only, unless admin)
router.get('/addresses/:userId?',
  [
    param('userId').optional().isMongoId().withMessage('Valid user ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user._id;
      const requestingUserRole = req.user.role;

      let targetUserId = userId || requestingUserId;

      // Check permissions
      if (targetUserId !== requestingUserId && !['admin', 'manager'].includes(requestingUserRole)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these addresses'
        });
      }

      const user = await User.findById(targetUserId).select('addresses');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user.addresses || []
      });
    } catch (error) {
      console.error('Get user addresses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch addresses'
      });
    }
  }
);

// Add address (own addresses only)
router.post('/addresses',
  [
    body('label').trim().isLength({ min: 1, max: 50 }).withMessage('Label must be 1-50 characters'),
    body('street').trim().isLength({ min: 1, max: 200 }).withMessage('Street address required'),
    body('city').trim().isLength({ min: 1, max: 100 }).withMessage('City required'),
    body('state').trim().isLength({ min: 1, max: 100 }).withMessage('State required'),
    body('zipCode').trim().isLength({ min: 1, max: 20 }).withMessage('ZIP code required'),
    body('country').trim().isLength({ min: 1, max: 100 }).withMessage('Country required'),
    body('coordinates').optional().isObject().withMessage('Coordinates must be object'),
    body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const addressData = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // If this is set as default, unset other default addresses
      if (addressData.isDefault) {
        if (user.addresses) {
          user.addresses.forEach(addr => {
            addr.isDefault = false;
          });
        }
      }

      // Add new address
      if (!user.addresses) user.addresses = [];
      user.addresses.push({
        ...addressData,
        _id: new Date().getTime().toString() // Simple ID generation
      });

      await user.save();

      res.status(201).json({
        success: true,
        data: user.addresses,
        message: 'Address added successfully'
      });
    } catch (error) {
      console.error('Add address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add address'
      });
    }
  }
);

// Update address (own addresses only)
router.patch('/addresses/:addressId',
  [
    param('addressId').trim().isLength({ min: 1 }).withMessage('Address ID required'),
    body('label').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Label must be 1-50 characters'),
    body('street').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Street address required'),
    body('city').optional().trim().isLength({ min: 1, max: 100 }).withMessage('City required'),
    body('state').optional().trim().isLength({ min: 1, max: 100 }).withMessage('State required'),
    body('zipCode').optional().trim().isLength({ min: 1, max: 20 }).withMessage('ZIP code required'),
    body('country').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Country required'),
    body('coordinates').optional().isObject().withMessage('Coordinates must be object'),
    body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { addressId } = req.params;
      const updateData = req.body;

      const user = await User.findById(userId);
      if (!user || !user.addresses) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      const addressIndex = user.addresses.findIndex(addr => addr._id === addressId);
      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      // If setting as default, unset other defaults
      if (updateData.isDefault) {
        user.addresses.forEach((addr, index) => {
          if (index !== addressIndex) addr.isDefault = false;
        });
      }

      // Update address
      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex],
        ...updateData
      };

      await user.save();

      res.json({
        success: true,
        data: user.addresses,
        message: 'Address updated successfully'
      });
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update address'
      });
    }
  }
);

// Delete address (own addresses only)
router.delete('/addresses/:addressId',
  [
    param('addressId').trim().isLength({ min: 1 }).withMessage('Address ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { addressId } = req.params;

      const user = await User.findById(userId);
      if (!user || !user.addresses) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      const addressIndex = user.addresses.findIndex(addr => addr._id === addressId);
      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Address not found'
        });
      }

      user.addresses.splice(addressIndex, 1);
      await user.save();

      res.json({
        success: true,
        data: user.addresses,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete address'
      });
    }
  }
);

// Get user favorites (own favorites only, unless admin)
router.get('/favorites/:userId?',
  [
    param('userId').optional().isMongoId().withMessage('Valid user ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user._id;
      const requestingUserRole = req.user.role;

      let targetUserId = userId || requestingUserId;

      // Check permissions
      if (targetUserId !== requestingUserId && !['admin', 'manager'].includes(requestingUserRole)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view favorites'
        });
      }

      const user = await User.findById(targetUserId)
        .select('favorites')
        .populate('favorites.itemId', 'name basePrice image');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user.favorites || []
      });
    } catch (error) {
      console.error('Get user favorites error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch favorites'
      });
    }
  }
);

// Add/remove favorite item
router.post('/favorites/:itemId',
  [
    param('itemId').isMongoId().withMessage('Valid item ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { itemId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.favorites) user.favorites = [];

      const existingIndex = user.favorites.findIndex(fav => fav.itemId.toString() === itemId);
      
      if (existingIndex >= 0) {
        // Remove from favorites
        user.favorites.splice(existingIndex, 1);
        await user.save();
        
        res.json({
          success: true,
          message: 'Item removed from favorites',
          isFavorite: false
        });
      } else {
        // Add to favorites
        user.favorites.push({
          itemId: itemId as any,
          addedAt: new Date()
        });
        await user.save();
        
        res.json({
          success: true,
          message: 'Item added to favorites',
          isFavorite: true
        });
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update favorites'
      });
    }
  }
);

// Get all users (admin/manager only)
router.get('/',
  authorize('admin', 'manager'),
  [
    query('role').optional().isIn(['customer', 'staff', 'manager', 'admin', 'rider']).withMessage('Invalid role'),
    query('isVerified').optional().isBoolean().withMessage('isVerified must be boolean'),
    query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
  ],
  validate,
  async (req, res) => {
    try {
      const {
        role,
        isVerified,
        search,
        page = 1,
        limit = 20
      } = req.query;

      const filter: Record<string, any> = {};
      if (role) filter.role = role;
      if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        User.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }
);

export default router;
