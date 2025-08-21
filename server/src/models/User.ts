import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, Address } from '../types/index.js';

const addressSchema = new Schema<Address>({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    required: true
  },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  instructions: String,
  isDefault: { type: Boolean, default: false }
});

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  roles: [{
    type: String,
    enum: ['customer', 'staff', 'manager', 'admin'],
    default: 'customer'
  }],
  hashedPassword: {
    type: String,
    required: true
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  addresses: [addressSchema],
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'addresses.zipCode': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('hashedPassword')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.hashedPassword;
  return userObject;
};

export const User = mongoose.model<IUser & Document>('User', userSchema);