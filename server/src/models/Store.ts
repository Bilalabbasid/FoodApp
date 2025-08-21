import mongoose, { Schema, Document } from 'mongoose';
import { Store as IStore, StoreHours, DeliveryZone, PaymentConfig, Address } from '../types/index.js';

const storeHoursSchema = new Schema<StoreHours>({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  },
  openTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  closeTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  isClosed: {
    type: Boolean,
    default: false
  }
});

const deliveryZoneSchema = new Schema<DeliveryZone>({
  name: { type: String, required: true },
  fee: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, required: true, min: 0 },
  radius: { type: Number, required: true, min: 0 },
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
});

const paymentConfigSchema = new Schema<PaymentConfig>({
  stripeEnabled: { type: Boolean, default: true },
  cashEnabled: { type: Boolean, default: false },
  minOrderForDelivery: { type: Number, default: 15 },
  maxOrderValue: { type: Number, default: 500 }
});

const addressSchema = new Schema<Address>({
  type: { type: String, default: 'other' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  instructions: String,
  isDefault: { type: Boolean, default: false }
});

const storeSchema = new Schema<IStore>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hours: [storeHoursSchema],
  isOpen: {
    type: Boolean,
    default: true
  },
  prepTimeMins: {
    type: Number,
    default: 30,
    min: 5
  },
  deliveryZones: [deliveryZoneSchema],
  paymentConfig: {
    type: paymentConfigSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

// Indexes
storeSchema.index({ slug: 1 });
storeSchema.index({ 'address.zipCode': 1 });
storeSchema.index({ isOpen: 1 });

export const Store = mongoose.model<IStore & Document>('Store', storeSchema);