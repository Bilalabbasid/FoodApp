import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useCart } from '../hooks/useCart';
import { api, handleApiError, handleApiSuccess } from '../utils/api';

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code required'),
  instructions: z.string().optional()
});

const guestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required')
});

type AddressForm = z.infer<typeof addressSchema>;
type GuestForm = z.infer<typeof guestSchema>;

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const cartStore = useCartStore();
  const { items, summary, isEmpty } = useCart();
  const { user, isAuthenticated } = useAuthStore();
  
  const { deliveryMethod, setTip, clearCart } = cartStore;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [customTip, setCustomTip] = useState('');

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors }
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: user?.addresses?.find(a => a.isDefault)?.street || '',
      city: user?.addresses?.find(a => a.isDefault)?.city || '',
      state: user?.addresses?.find(a => a.isDefault)?.state || '',
      zipCode: user?.addresses?.find(a => a.isDefault)?.zipCode || '',
      instructions: user?.addresses?.find(a => a.isDefault)?.instructions || ''
    }
  });

  const {
    register: registerGuest,
    handleSubmit: handleGuestSubmit,
    formState: { errors: guestErrors }
  } = useForm<GuestForm>({
    resolver: zodResolver(guestSchema)
  });

  const tipPresets = [0, 15, 18, 20, 25];

  const handleTipChange = (percentage: number) => {
    setSelectedTip(percentage);
    setCustomTip('');
    const tipAmount = summary ? (summary.subtotal * percentage) / 100 : 0;
    setTip(tipAmount);
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    setSelectedTip(0);
    const tipAmount = parseFloat(value) || 0;
    setTip(tipAmount);
  };

  const handleSubmit = async (addressData?: AddressForm, guestData?: GuestForm) => {
    if (!stripe || !elements || !summary) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const orderData = {
        storeId: 'downtown',
        items: items.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant?.id,
          selectedAddons: item.selectedAddons.map(a => a.id),
          specialInstructions: item.specialInstructions
        })),
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? addressData : undefined,
        guestContact: !isAuthenticated ? guestData : undefined,
        tip: summary.tip || 0
      };

      const response = await api.createOrder(orderData);

      if (response.success) {
        // Simulate payment success for demo
        console.log('Order created successfully:', response.data);

        clearCart();
        handleApiSuccess('Order placed successfully!');
        navigate(`/order/${response.data.orderNo}`);
      }
    } catch (error) {
      handleApiError(error, 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!summary || isEmpty) {
    navigate('/cart');
    return null;
  }

  const totalWithTip = summary.total;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-8"
      >
        <button
          onClick={() => navigate('/cart')}
          className="mr-4 p-2 text-gray-600 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout form */}
        <div className="space-y-6">
          {/* Guest information (if not authenticated) */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    {...registerGuest('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  {guestErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{guestErrors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      {...registerGuest('email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    {guestErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{guestErrors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      {...registerGuest('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    {guestErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{guestErrors.phone.message}</p>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* Delivery address (if delivery) */}
          {deliveryMethod === 'delivery' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Address
              </h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    {...registerAddress('street')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  {addressErrors.street && (
                    <p className="mt-1 text-sm text-red-600">{addressErrors.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      {...registerAddress('city')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    {addressErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{addressErrors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      {...registerAddress('state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    />
                    {addressErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{addressErrors.state.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    {...registerAddress('zipCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  {addressErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{addressErrors.zipCode.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    {...registerAddress('instructions')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    placeholder="Building entrance, apartment number, etc."
                  />
                </div>
              </form>
            </motion.div>
          )}

          {/* Tip selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Tip</h2>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {tipPresets.map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handleTipChange(percentage)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    selectedTip === percentage
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{percentage}%</div>
                  <div className="text-sm text-gray-600">
                    {formatPrice((summary.subtotal * percentage) / 100)}
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Tip Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customTip}
                onChange={(e) => handleCustomTipChange(e.target.value)}
                placeholder="Enter custom amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
          </motion.div>

          {/* Payment method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </h2>
            
            <div className="p-4 border border-gray-300 rounded-lg">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Order summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Order items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.selectedVariant && (
                      <p className="text-sm text-gray-600">{item.selectedVariant.name}</p>
                    )}
                    {item.selectedAddons.length > 0 && (
                      <p className="text-sm text-gray-600">
                        + {item.selectedAddons.map(a => a.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900 ml-4">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="border-t pt-4 space-y-2 text-sm">
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
              
              {summary.tip > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tip</span>
                  <span>{formatPrice(summary.tip)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(totalWithTip)}</span>
              </div>
            </div>
          </div>

          {/* Place order button */}
          <button
            onClick={isAuthenticated 
              ? handleAddressSubmit(addressData => handleSubmit(addressData))
              : handleGuestSubmit(guestData => handleSubmit(undefined, guestData))
            }
            disabled={isProcessing || !stripe}
            className="w-full bg-orange-500 text-white py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(totalWithTip)}`}
          </button>

          {/* Security note */}
          <div className="text-center text-sm text-gray-500">
            <p>Your payment information is secure and encrypted</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;