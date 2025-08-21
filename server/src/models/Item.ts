import mongoose, { Schema, Document } from 'mongoose';
import { Item as IItem, Variant, AddonGroup, Addon } from '../types/index.js';

const addonSchema = new Schema<Addon>({
  name: { type: String, required: true },
  priceDelta: { type: Number, required: true, default: 0 },
  sku: String,
  isAvailable: { type: Boolean, default: true }
});

const addonGroupSchema = new Schema<AddonGroup>({
  name: { type: String, required: true },
  min: { type: Number, required: true, min: 0 },
  max: { type: Number, required: true, min: 1 },
  addons: [addonSchema],
  isRequired: { type: Boolean, default: false }
});

const variantSchema = new Schema<Variant>({
  name: { type: String, required: true },
  priceDelta: { type: Number, required: true, default: 0 },
  sku: String,
  isDefault: { type: Boolean, default: false }
});

const itemSchema = new Schema<IItem>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String],
  tags: [String],
  dietary: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'halal', 'spicy']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  variants: [variantSchema],
  addonGroups: [addonGroupSchema],
  prepTimeMinutes: {
    type: Number,
    default: 15,
    min: 1
  },
  calories: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
itemSchema.index({ storeId: 1, slug: 1 }, { unique: true });
itemSchema.index({ storeId: 1, categoryId: 1 });
itemSchema.index({ storeId: 1, isAvailable: 1 });
itemSchema.index({ name: 'text', description: 'text', tags: 'text' });
itemSchema.index({ dietary: 1 });
itemSchema.index({ tags: 1 });

export const Item = mongoose.model<IItem & Document>('Item', itemSchema);