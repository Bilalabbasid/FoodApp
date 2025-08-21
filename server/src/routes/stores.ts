import express from 'express';
import { Store } from '../models/Store.js';
import { Category } from '../models/Category.js';
import { Item } from '../models/Item.js';

const router = express.Router();

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find({ isOpen: true }).select('-paymentConfig');
    
    res.json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores'
    });
  }
});

// Get store by slug
router.get('/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug });
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store'
    });
  }
});

// Get store menu
router.get('/:storeSlug/menu', async (req, res) => {
  try {
    const { storeSlug } = req.params;
    const { category, search, dietary, tag } = req.query;

    // Find store by slug
    const store = await Store.findOne({ slug: storeSlug });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Get categories
    const categoriesQuery: any = { storeId: store._id, isActive: true };
    const categories = await Category.find(categoriesQuery).sort({ order: 1 });

    // Get items
    const itemsQuery: any = { storeId: store._id, isAvailable: true };
    
    if (category) {
      const categoryDoc = await Category.findOne({ storeId: store._id, slug: category });
      if (categoryDoc) {
        itemsQuery.categoryId = categoryDoc._id;
      }
    }

    if (search) {
      itemsQuery.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    if (dietary) {
      itemsQuery.dietary = { $in: [dietary] };
    }

    if (tag) {
      itemsQuery.tags = { $in: [tag] };
    }

    const items = await Item.find(itemsQuery)
      .populate('categoryId', 'name slug')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        store,
        categories,
        items
      }
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu'
    });
  }
});

// Get item by slug
router.get('/:storeSlug/items/:slug', async (req, res) => {
  try {
    const { storeSlug, slug } = req.params;
    
    // Find store by slug
    const store = await Store.findOne({ slug: storeSlug });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }
    
    const item = await Item.findOne({ storeId: store._id, slug, isAvailable: true })
      .populate('categoryId', 'name slug');
    
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
});

// Get store categories
router.get('/:storeSlug/categories', async (req, res) => {
  try {
    const { storeSlug } = req.params;
    
    // Find store by slug
    const store = await Store.findOne({ slug: storeSlug });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const categories = await Category.find({ storeId: store._id, isActive: true })
      .sort({ order: 1 });

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
});

// Get store items
router.get('/:storeSlug/items', async (req, res) => {
  try {
    const { storeSlug } = req.params;
    const { category, search } = req.query;
    
    // Find store by slug
    const store = await Store.findOne({ slug: storeSlug });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Get items
    const itemsQuery: any = { storeId: store._id, isAvailable: true };
    
    if (category) {
      const categoryDoc = await Category.findOne({ storeId: store._id, slug: category });
      if (categoryDoc) {
        itemsQuery.categoryId = categoryDoc._id;
      }
    }

    if (search) {
      itemsQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const items = await Item.find(itemsQuery)
      .populate('categoryId', 'name slug')
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get store items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items'
    });
  }
});

export default router;