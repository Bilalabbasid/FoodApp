import React, { useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const cartStore = useCartStore();
  const { 
    items, 
    summary,
    itemCount
  } = useCart();
  
  const { updateQuantity, removeItem } = cartStore;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Your Cart</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
                  <Link
                    to="/menu"
                    onClick={onClose}
                    className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    Browse Menu
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Your Cart ({items.length})</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.itemId}-${index}`}
                    layout
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
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
                      </div>
                      <button
                        onClick={() => removeItem(item.itemId, item.selectedVariant?.id, item.selectedAddons.map(a => a.id))}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity - 1, item.selectedVariant?.id, item.selectedAddons.map(a => a.id))}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, item.quantity + 1, item.selectedVariant?.id, item.selectedAddons.map(a => a.id))}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Summary and checkout */}
            <div className="border-t p-4 space-y-4">
              {summary && (
                <div className="space-y-2 text-sm">
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
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(summary.total + summary.tip)}</span>
                  </div>
                </div>
              )}

              <Link
                to="/checkout"
                onClick={onClose}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;