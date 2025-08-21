import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.js';
import { PricingCalculator } from '../utils/pricing.js';
import { optionalAuth } from '../middleware/auth.js';
import { Store } from '../models/Store.js';

const router = express.Router();

// Calculate cart pricing
router.post('/price',
  optionalAuth,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.itemId').isMongoId().withMessage('Valid item ID required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('storeId').isString().withMessage('Store ID required'),
    body('deliveryMethod').isIn(['pickup', 'delivery']).withMessage('Valid delivery method required')
  ],
  validate,
  async (req: any, res) => {
    try {
      const { items, storeId, deliveryMethod, deliveryZoneId, couponCode, zipCode } = req.body;
      
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
      
      const userId = req.user?._id;
      
      const summary = await PricingCalculator.calculateCart(items, {
        storeId: store._id.toString(),
        deliveryMethod,
        deliveryZoneId,
        couponCode,
        userId,
        zipCode
      });

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Cart pricing error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to calculate pricing',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
);

export default router;