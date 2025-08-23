import express from 'express';
import { body, param, query } from 'express-validator';
import { Item } from '../models/Item.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get all items with filters (public)
router.get('/',
  [
    query('storeId').optional().isMongoId().withMessage('Valid store ID required'),
    query('categoryId').optional().isMongoId().withMessage('Valid category ID required'),
    query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term required'),
    query('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'popularity']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
  ],
  validate,
  async (req, res) => {
    try {
      const {
        storeId,
        categoryId,
        search,
        isAvailable,
        page = 1,
        limit = 20,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const filter: Record<string, any> = {};
      
      if (storeId) filter.storeId = storeId;
      if (categoryId) filter.categoryId = categoryId;
      if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const sortOptions: Record<string, 1 | -1> = {};
      sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const [items, total] = await Promise.all([
        Item.find(filter)
          .populate('categoryId', 'name')
          .populate('storeId', 'name')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum),
        Item.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch items'
      });
    }
  }
);

// Get item by ID or slug (public)
router.get('/:identifier',
  [
    param('identifier').trim().isLength({ min: 1 }).withMessage('Item identifier required')
  ],
  validate,
  async (req, res) => {
    try {
      const { identifier } = req.params;

      // Try to find by ID first, then by slug
      let item;
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        item = await Item.findById(identifier)
          .populate('categoryId', 'name')
          .populate('storeId', 'name');
      } else {
        item = await Item.findOne({ slug: identifier })
          .populate('categoryId', 'name')
          .populate('storeId', 'name');
      }

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('Get item error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch item'
      });
    }
  }
);

// Create item (admin/manager only)
router.post('/',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('storeId').isMongoId().withMessage('Valid store ID required'),
    body('categoryId').isMongoId().withMessage('Valid category ID required'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description required, max 1000 characters'),
    body('basePrice').isFloat({ min: 0 }).withMessage('Base price must be positive'),
    body('variants').optional().isArray().withMessage('Variants must be array'),
    body('addons').optional().isArray().withMessage('Addons must be array'),
    body('tags').optional().isArray().withMessage('Tags must be array'),
    body('nutritionalInfo').optional().isObject().withMessage('Nutritional info must be object'),
    body('allergens').optional().isArray().withMessage('Allergens must be array'),
    body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be positive'),
    body('isVegetarian').optional().isBoolean().withMessage('isVegetarian must be boolean'),
    body('isVegan').optional().isBoolean().withMessage('isVegan must be boolean'),
    body('isGlutenFree').optional().isBoolean().withMessage('isGlutenFree must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const itemData = req.body;
      
      // Generate slug from name
      itemData.slug = itemData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const item = new Item(itemData);
      await item.save();
      
      await item.populate('categoryId', 'name');
      await item.populate('storeId', 'name');

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

// Update item (admin/manager only)
router.patch('/:itemId',
  authenticate,
  authorize('admin', 'manager'),
  [
    param('itemId').isMongoId().withMessage('Valid item ID required'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('description').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Description max 1000 characters'),
    body('basePrice').optional().isFloat({ min: 0 }).withMessage('Base price must be positive'),
    body('variants').optional().isArray().withMessage('Variants must be array'),
    body('addons').optional().isArray().withMessage('Addons must be array'),
    body('tags').optional().isArray().withMessage('Tags must be array'),
    body('nutritionalInfo').optional().isObject().withMessage('Nutritional info must be object'),
    body('allergens').optional().isArray().withMessage('Allergens must be array'),
    body('preparationTime').optional().isInt({ min: 1 }).withMessage('Preparation time must be positive'),
    body('isVegetarian').optional().isBoolean().withMessage('isVegetarian must be boolean'),
    body('isVegan').optional().isBoolean().withMessage('isVegan must be boolean'),
    body('isGlutenFree').optional().isBoolean().withMessage('isGlutenFree must be boolean'),
    body('isAvailable').optional().isBoolean().withMessage('isAvailable must be boolean')
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

// Toggle item availability (admin/manager/staff)
router.patch('/:itemId/availability',
  authenticate,
  authorize('admin', 'manager', 'staff'),
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
        { isAvailable, updatedAt: new Date() },
        { new: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      // Emit real-time update to all connected clients
      const io = req.app.get('io');
      if (io) {
        io.emit('itemAvailabilityUpdate', {
          itemId,
          isAvailable
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

// Delete item (admin only)
router.delete('/:itemId',
  authenticate,
  authorize('admin'),
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

// Get popular items (public)
router.get('/popular/list',
  [
    query('storeId').optional().isMongoId().withMessage('Valid store ID required'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
  ],
  validate,
  async (req, res) => {
    try {
      const { storeId, limit = 10 } = req.query;
      
      const filter: Record<string, any> = { isAvailable: true };
      if (storeId) filter.storeId = storeId;

      // In a real implementation, you'd track popularity metrics
      // For now, we'll return items sorted by creation date
      const items = await Item.find(filter)
        .populate('categoryId', 'name')
        .populate('storeId', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string));

      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Get popular items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch popular items'
      });
    }
  }
);

export default router;
