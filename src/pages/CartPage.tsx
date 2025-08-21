import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, X, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useCart } from '../hooks/useCart';

const CartPage: React.FC = () => {
  const cartStore = useCartStore();
  const { items, summary, isEmpty } = useCart();
  
  const { 
    deliveryMethod,
    couponCode,
    updateQuantity, 
    removeItem,
    setDeliveryMethod,
    setCouponCode,
    clearCart
  } = cartStore;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-xl text-gray-600 mb-8">Add some delicious items to get started!</p>
          <Link
            to="/menu"
            className="inline-flex items-center px-8 py-4 bg-orange-500 text-white rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Browse Menu
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        </div>
        
        <button
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Clear Cart
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Method</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryMethod('pickup')}
                className={`p-4 rounded-lg border text-center transition-colors ${
                  deliveryMethod === 'pickup'
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Pickup</div>
                <div className="text-sm text-gray-600">Ready in 25-30 min</div>
              </button>
              <button
                onClick={() => setDeliveryMethod('delivery')}
                className={`p-4 rounded-lg border text-center transition-colors ${
                  deliveryMethod === 'delivery'
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium">Delivery</div>
                <div className="text-sm text-gray-600">35-45 min</div>
              </button>
            </div>
          </motion.div>

          {/* Cart items list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.itemId}-${index}`}
                  layout
                  className="flex items-start space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {item.selectedVariant && (
                      <p className="text-sm text-gray-600">{item.selectedVariant.name}</p>
                    )}
                    {item.selectedAddons.length > 0 && (
                      <p className="text-sm text-gray-600">
                        + {item.selectedAddons.map(a => a.name).join(', ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-600 italic">"{item.specialInstructions}"</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity - 1, item.selectedVariant?.id, item.selectedAddons.map(a => a.id))}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity + 1, item.selectedVariant?.id, item.selectedAddons.map(a => a.id))}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(item.totalPrice)}
                        </span>
                        <button
                          onClick={() => removeItem(item.itemId, item.selectedVariant?.id, item.selectedAddons.map(a => a.id))}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Order summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Coupon code */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promo Code</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={couponCode || ''}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Order summary */}
          {summary && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(summary.subtotal)}</span>
                </div>
                
                {summary.discounts.map((discount, index) => (
                  <div key={index} className="flex justify-between text-green-600">
                    <span>{discount.name}</span>
                    <span>-{formatPrice(discount.amount)}</span>
                  </div>
                ))}
                
                {summary.taxes.map((tax, index) => (
                  <div key={index} className="flex justify-between text-gray-600">
                    <span>{tax.name}</span>
                    <span>{formatPrice(tax.amount)}</span>
                  </div>
                ))}
                
                {summary.fees.map((fee, index) => (
                  <div key={index} className="flex justify-between text-gray-600">
                    <span>{fee.name}</span>
                    <span>{formatPrice(fee.amount)}</span>
                  </div>
                ))}
                
                {summary.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{formatPrice(summary.deliveryFee)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(summary.total)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage;