import crypto from 'crypto';
import { CartItem, CartSummary, Discount, Tax, Fee } from '../types/index.js';
import { Item } from '../models/Item.js';
import { Store } from '../models/Store.js';
import { Coupon } from '../models/Coupon.js';

interface PricingOptions {
  storeId: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryZoneId?: string;
  couponCode?: string;
  userId?: string;
  zipCode?: string;
}

export class PricingCalculator {
  static async calculateCart(
    items: CartItem[],
    options: PricingOptions
  ): Promise<CartSummary> {
    const store = await Store.findById(options.storeId);
    if (!store) {
      throw new Error('Store not found');
    }

    // Calculate subtotal
    let subtotal = 0;
    const validatedItems: CartItem[] = [];

    for (const cartItem of items) {
      const item = await Item.findById(cartItem.itemId);
      if (!item || !item.isAvailable) {
        throw new Error(`Item ${cartItem.itemId} not found or unavailable`);
      }

      let itemPrice = item.basePrice;

      // Add variant price delta
      if (cartItem.selectedVariant) {
        const variant = item.variants.find((v: any) => v._id?.toString() === cartItem.selectedVariant);
        if (variant) {
          itemPrice += variant.priceDelta;
        }
      }

      // Add addon prices
      let addonTotal = 0;
      if (cartItem.selectedAddons?.length > 0) {
        for (const addonId of cartItem.selectedAddons) {
          for (const group of item.addonGroups || []) {
            const addon = group.addons.find((a: any) => a._id?.toString() === addonId);
            if (addon && addon.isAvailable) {
              addonTotal += addon.priceDelta;
            }
          }
        }
      }

      itemPrice += addonTotal;
      const itemTotal = itemPrice * cartItem.quantity;

      validatedItems.push({
        ...cartItem,
        itemId: cartItem.itemId,
        name: item.name,
        unitPrice: itemPrice,
        totalPrice: itemTotal
      });

      subtotal += itemTotal;
    }

    // Apply discounts
    const discounts: Discount[] = [];
    if (options.couponCode) {
      const discount = await this.applyCoupon(options.couponCode, subtotal, options.storeId, options.userId);
      if (discount) {
        discounts.push(discount);
      }
    }

    const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);
    const discountedSubtotal = Math.max(0, subtotal - discountTotal);

    // Calculate taxes (configurable per store)
    const taxRate = 0.0875; // 8.75% default NYC sales tax
    const taxes: Tax[] = [{
      name: 'Sales Tax',
      rate: taxRate,
      amount: Math.round(discountedSubtotal * taxRate * 100) / 100
    }];

    const taxTotal = taxes.reduce((sum, t) => sum + t.amount, 0);

    // Calculate fees
    const fees: Fee[] = [];
    const serviceFeRate = 0.03; // 3% service fee
    const serviceFee = Math.round(discountedSubtotal * serviceFeRate * 100) / 100;
    
    fees.push({
      name: 'Service Fee',
      type: 'percentage',
      amount: serviceFee
    });

    const feeTotal = fees.reduce((sum, f) => sum + f.amount, 0);

    // Calculate delivery fee
    let deliveryFee = 0;
    if (options.deliveryMethod === 'delivery' && options.deliveryZoneId) {
      const zone = store.deliveryZones.find(z => z._id?.toString() === options.deliveryZoneId);
      if (zone) {
        deliveryFee = zone.fee;
      }
    }

    // Calculate total
    const total = discountedSubtotal + taxTotal + feeTotal + deliveryFee;

    const summary: CartSummary = {
      items: validatedItems,
      subtotal,
      discounts,
      taxes,
      fees,
      deliveryFee,
      tip: 0, // Will be set during checkout
      total,
      hash: this.generatePricingHash({
        subtotal,
        discountTotal,
        taxTotal,
        feeTotal,
        deliveryFee,
        total
      })
    };

    return summary;
  }

  private static async applyCoupon(
    code: string,
    subtotal: number,
    storeId: string,
    userId?: string
  ): Promise<Discount | null> {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startsAt: { $lte: new Date() },
      endsAt: { $gte: new Date() }
    });

    if (!coupon) {
      return null;
    }

    // Check if coupon applies to this store
    if (coupon.applicableStores.length > 0 && !coupon.applicableStores.some(id => id.toString() === storeId)) {
      return null;
    }

    // Check minimum subtotal
    if (subtotal < coupon.minSubtotal) {
      return null;
    }

    // Check usage limits
    if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
      return null;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = (subtotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    // Apply max discount limit
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    // Don't let discount exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      type: 'coupon',
      name: `Coupon: ${coupon.code}`,
      amount: Math.round(discountAmount * 100) / 100,
      code: coupon.code
    };
  }

  private static generatePricingHash(data: any): string {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(data))
      .digest('hex');
  }

  static verifyPricingHash(summary: CartSummary): boolean {
    const { hash, ...data } = summary;
    const expectedHash = this.generatePricingHash({
      subtotal: data.subtotal,
      discountTotal: data.discounts.reduce((sum, d) => sum + d.amount, 0),
      taxTotal: data.taxes.reduce((sum, t) => sum + t.amount, 0),
      feeTotal: data.fees.reduce((sum, f) => sum + f.amount, 0),
      deliveryFee: data.deliveryFee,
      total: data.total
    });
    return hash === expectedHash;
  }
}