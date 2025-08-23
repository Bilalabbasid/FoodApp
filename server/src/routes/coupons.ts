import express from 'express';
import { body, param, query } from 'express-validator';
import { Coupon } from '../models/Coupon.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);

// Validate coupon code (public for customers during checkout)
router.post('/validate',
  [
    body('code').trim().isLength({ min: 1, max: 20 }).withMessage('Coupon code required'),
    body('orderValue').optional().isFloat({ min: 0 }).withMessage('Order value must be positive'),
    body('storeId').optional().isMongoId().withMessage('Valid store ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { code, orderValue = 0, storeId } = req.body;

      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        startsAt: { $lte: new Date() },
        endsAt: { $gte: new Date() }
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or expired coupon code'
        });
      }

      // Check usage limits
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({
          success: false,
          message: 'Coupon usage limit exceeded'
        });
      }

      // Check minimum order value
      if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
        return res.status(400).json({
          success: false,
          message: `Minimum order value of $${coupon.minOrderValue} required`
        });
      }

      // Check store restrictions
      if (coupon.applicableStores && coupon.applicableStores.length > 0) {
        if (!storeId || !coupon.applicableStores.includes(storeId)) {
          return res.status(400).json({
            success: false,
            message: 'Coupon not valid for this store'
          });
        }
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.type === 'percent') {
        discountAmount = (orderValue * coupon.value) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = coupon.value;
      }

      res.json({
        success: true,
        data: {
          coupon: {
            _id: coupon._id,
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            maxDiscountAmount: coupon.maxDiscountAmount
          },
          discountAmount,
          finalAmount: Math.max(0, orderValue - discountAmount)
        },
        message: 'Coupon is valid'
      });
    } catch (error) {
      console.error('Validate coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate coupon'
      });
    }
  }
);

// Get all coupons (admin/manager only)
router.get('/',
  authorize('admin', 'manager'),
  [
    query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    query('type').optional().isIn(['percent', 'fixed']).withMessage('Invalid coupon type'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
  ],
  validate,
  async (req, res) => {
    try {
      const {
        isActive,
        type,
        page = 1,
        limit = 20
      } = req.query;

      const filter: Record<string, any> = {};
      if (isActive !== undefined) filter.isActive = isActive === 'true';
      if (type) filter.type = type;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [coupons, total] = await Promise.all([
        Coupon.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Coupon.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: coupons,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Get coupons error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coupons'
      });
    }
  }
);

// Get coupon by ID (admin/manager only)
router.get('/:couponId',
  authorize('admin', 'manager'),
  [
    param('couponId').isMongoId().withMessage('Valid coupon ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { couponId } = req.params;

      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      res.json({
        success: true,
        data: coupon
      });
    } catch (error) {
      console.error('Get coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coupon'
      });
    }
  }
);

// Create coupon (admin/manager only)
router.post('/',
  authorize('admin', 'manager'),
  [
    body('code').trim().isLength({ min: 3, max: 20 }).withMessage('Code must be 3-20 characters'),
    body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description required, max 200 characters'),
    body('type').isIn(['percent', 'fixed']).withMessage('Type must be percent or fixed'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be positive'),
    body('minOrderValue').optional().isFloat({ min: 0 }).withMessage('Min order value must be positive'),
    body('maxDiscountAmount').optional().isFloat({ min: 0 }).withMessage('Max discount amount must be positive'),
    body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be positive'),
    body('startsAt').isISO8601().withMessage('Valid start date required'),
    body('endsAt').isISO8601().withMessage('Valid end date required'),
    body('applicableStores').optional().isArray().withMessage('Applicable stores must be array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const couponData = req.body;
      
      // Ensure code is uppercase
      couponData.code = couponData.code.toUpperCase();
      
      // Validate date range
      if (new Date(couponData.startsAt) >= new Date(couponData.endsAt)) {
        return res.status(400).json({
          success: false,
          message: 'Start date must be before end date'
        });
      }

      // For percentage coupons, ensure value is not more than 100
      if (couponData.type === 'percent' && couponData.value > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage value cannot exceed 100'
        });
      }

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

// Update coupon (admin/manager only)
router.patch('/:couponId',
  authorize('admin', 'manager'),
  [
    param('couponId').isMongoId().withMessage('Valid coupon ID required'),
    body('code').optional().trim().isLength({ min: 3, max: 20 }).withMessage('Code must be 3-20 characters'),
    body('description').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Description max 200 characters'),
    body('type').optional().isIn(['percent', 'fixed']).withMessage('Type must be percent or fixed'),
    body('value').optional().isFloat({ min: 0 }).withMessage('Value must be positive'),
    body('minOrderValue').optional().isFloat({ min: 0 }).withMessage('Min order value must be positive'),
    body('maxDiscountAmount').optional().isFloat({ min: 0 }).withMessage('Max discount amount must be positive'),
    body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be positive'),
    body('startsAt').optional().isISO8601().withMessage('Valid start date required'),
    body('endsAt').optional().isISO8601().withMessage('Valid end date required'),
    body('applicableStores').optional().isArray().withMessage('Applicable stores must be array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const { couponId } = req.params;
      const updateData = req.body;

      // Ensure code is uppercase if provided
      if (updateData.code) {
        updateData.code = updateData.code.toUpperCase();
      }

      // Validate date range if both dates are provided
      if (updateData.startsAt && updateData.endsAt) {
        if (new Date(updateData.startsAt) >= new Date(updateData.endsAt)) {
          return res.status(400).json({
            success: false,
            message: 'Start date must be before end date'
          });
        }
      }

      // For percentage coupons, ensure value is not more than 100
      if (updateData.type === 'percent' && updateData.value > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage value cannot exceed 100'
        });
      }

      const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      res.json({
        success: true,
        data: coupon,
        message: 'Coupon updated successfully'
      });
    } catch (error) {
      console.error('Update coupon error:', error);
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to update coupon'
      });
    }
  }
);

// Delete coupon (admin only)
router.delete('/:couponId',
  authorize('admin'),
  [
    param('couponId').isMongoId().withMessage('Valid coupon ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { couponId } = req.params;

      const coupon = await Coupon.findByIdAndDelete(couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      res.json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      console.error('Delete coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete coupon'
      });
    }
  }
);

// Toggle coupon active status (admin/manager only)
router.patch('/:couponId/toggle',
  authorize('admin', 'manager'),
  [
    param('couponId').isMongoId().withMessage('Valid coupon ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { couponId } = req.params;

      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      coupon.isActive = !coupon.isActive;
      coupon.updatedAt = new Date();
      await coupon.save();

      res.json({
        success: true,
        data: coupon,
        message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Toggle coupon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle coupon status'
      });
    }
  }
);

// Get coupon usage statistics (admin/manager only)
router.get('/:couponId/stats',
  authorize('admin', 'manager'),
  [
    param('couponId').isMongoId().withMessage('Valid coupon ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { couponId } = req.params;

      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: 'Coupon not found'
        });
      }

      // In a real implementation, you'd query orders that used this coupon
      const stats = {
        totalUses: coupon.usedCount || 0,
        maxUses: coupon.maxUses || 'Unlimited',
        totalDiscountGiven: 0, // Would calculate from orders
        averageOrderValue: 0, // Would calculate from orders
        usageRate: coupon.maxUses ? ((coupon.usedCount || 0) / coupon.maxUses) * 100 : 0
      };

      res.json({
        success: true,
        data: {
          coupon,
          stats
        }
      });
    } catch (error) {
      console.error('Get coupon stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coupon statistics'
      });
    }
  }
);

export default router;
