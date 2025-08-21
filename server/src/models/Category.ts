import mongoose, { Schema, Document } from 'mongoose';
import { Category as ICategory } from '../types/index.js';

const categorySchema = new Schema<ICategory>({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
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
    trim: true
  },
  image: String,
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound indexes
categorySchema.index({ storeId: 1, slug: 1 }, { unique: true });
categorySchema.index({ storeId: 1, order: 1 });
categorySchema.index({ storeId: 1, isActive: 1 });

export const Category = mongoose.model<ICategory & Document>('Category', categorySchema);