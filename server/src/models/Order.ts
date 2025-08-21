import mongoose, { Schema, Document } from 'mongoose';
import { Order as IOrder, OrderItem, Payment, OrderStatusUpdate, Address } from '../types/index.js';

const addressSchema = new Schema<Address>({
  type: String,
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  instructions: String,
  isDefault: { type: Boolean, default: false }
});

const orderItemSchema = new Schema<OrderItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedVariant: {
    name: String,
    priceDelta: { type: Number, default: 0 }
  },
  selectedAddons: [{
    name: { type: String, required: true },
    priceDelta: { type: Number, default: 0 }
  }],
  specialInstructions: String,
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
});

const paymentSchema = new Schema<Payment>({
  provider: {
    type: String,
    enum: ['stripe', 'cash'],
    required: true
  },
  intentId: String,
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'usd' },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  refundAmount: { type: Number, min: 0 },
  capturedAt: Date
}, {
  timestamps: true
});

const statusUpdateSchema = new Schema<OrderStatusUpdate>({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled', 'refunded'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  note: String,
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const orderSchema = new Schema<IOrder>({
  orderNo: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  guestContact: {
    name: String,
    email: String,
    phone: String
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  items: [orderItemSchema],
  pricing: {
    subtotal: { type: Number, required: true, min: 0 },
    discounts: [{
      type: { type: String, enum: ['coupon', 'loyalty', 'promotion'] },
      name: String,
      amount: Number,
      code: String
    }],
    taxes: [{
      name: String,
      rate: Number,
      amount: Number
    }],
    fees: [{
      name: String,
      type: { type: String, enum: ['flat', 'percentage'] },
      amount: Number
    }],
    deliveryFee: { type: Number, default: 0, min: 0 },
    tip: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: true
  },
  deliveryAddress: addressSchema,
  deliveryInstructions: String,
  scheduledFor: Date,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'cancelled', 'refunded'],
    default: 'pending'
  },
  payments: [paymentSchema],
  timeline: [statusUpdateSchema],
  notes: String,
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedReadyTime: Date,
  actualReadyTime: Date
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNo: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1 });
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'guestContact.email': 1 });
orderSchema.index({ 'guestContact.phone': 1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNo) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNo = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export const Order = mongoose.model<IOrder & Document>('Order', orderSchema);