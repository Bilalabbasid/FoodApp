import mongoose, { Schema, Document } from 'mongoose';
import { Coupon as ICoupon } from '../types/index.js';

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percent', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minSubtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  startsAt: {
    type: Date,
    required: true
  },
  endsAt: {
    type: Date,
    required: true
  },
  uses: {
    type: Number,
    default: 0,
    min: 0
  },
  maxUses: {
    type: Number,
    min: 1
  },
  perUserLimit: {
    type: Number,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableStores: [{
    type: Schema.Types.ObjectId,
    ref: 'Store'
  }],
  applicableCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }]
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });
couponSchema.index({ applicableStores: 1 });

export const Coupon = mongoose.model<ICoupon & Document>('Coupon', couponSchema);