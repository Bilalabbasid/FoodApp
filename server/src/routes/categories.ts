import express from 'express';
import { body, param, query } from 'express-validator';
import { Category } from '../models/Category.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get all categories (public)
router.get('/',
  [
    query('storeId').optional().isMongoId().withMessage('Valid store ID required'),
    query('includeInactive').optional().isBoolean().withMessage('includeInactive must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const { storeId, includeInactive } = req.query;
      
      const filter: any = {};
      if (storeId) filter.storeId = storeId;
      if (!includeInactive || includeInactive === 'false') {
        filter.isActive = true;
      }

      const categories = await Category.find(filter)
        .populate('storeId', 'name')
        .sort({ sortOrder: 1, name: 1 });

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }
);

// Get category by ID (public)
router.get('/:categoryId',
  [
    param('categoryId').isMongoId().withMessage('Valid category ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { categoryId } = req.params;

      const category = await Category.findById(categoryId)
        .populate('storeId', 'name');

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category'
      });
    }
  }
);

// Create category (admin/manager only)
router.post('/',
  authenticate,
  authorize('admin', 'manager'),
  [
    body('storeId').isMongoId().withMessage('Valid store ID required'),
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 characters'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be non-negative')
  ],
  validate,
  async (req, res) => {
    try {
      const categoryData = req.body;
      
      // Generate slug from name
      categoryData.slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const category = new Category(categoryData);
      await category.save();

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully'
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category'
      });
    }
  }
);

// Update category (admin/manager only)
router.patch('/:categoryId',
  authenticate,
  authorize('admin', 'manager'),
  [
    param('categoryId').isMongoId().withMessage('Valid category ID required'),
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description max 500 characters'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('Sort order must be non-negative'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  validate,
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const updateData = req.body;

      // If name is being updated, regenerate slug
      if (updateData.name) {
        updateData.slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      const category = await Category.findByIdAndUpdate(
        categoryId,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).populate('storeId', 'name');

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully'
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update category'
      });
    }
  }
);

// Delete category (admin only)
router.delete('/:categoryId',
  authenticate,
  authorize('admin'),
  [
    param('categoryId').isMongoId().withMessage('Valid category ID required')
  ],
  validate,
  async (req, res) => {
    try {
      const { categoryId } = req.params;

      const category = await Category.findByIdAndDelete(categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }
  }
);

export default router;
