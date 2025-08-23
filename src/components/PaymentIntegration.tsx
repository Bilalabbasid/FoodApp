import { useState } from 'react';
import { CreditCard, Smartphone, DollarSign, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCart } from '../hooks/useCart';

interface PaymentMethod {
  id: string;
  type: 'card' | 'digital' | 'cash';
  name: string;
  icon: React.ReactNode;
  description: string;
  processing?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard size={24} />,
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'apple-pay',
    type: 'digital',
    name: 'Apple Pay',
    icon: <Smartphone size={24} />,
    description: 'Pay with Touch ID or Face ID'
  },
  {
    id: 'google-pay',
    type: 'digital',
    name: 'Google Pay',
    icon: <Smartphone size={24} />,
    description: 'Quick and secure payments'
  },
  {
    id: 'cash',
    type: 'cash',
    name: 'Cash on Delivery',
    icon: <DollarSign size={24} />,
    description: 'Pay when your order arrives'
  }
];

interface PaymentResult {
  id: string;
  method: string;
  amount: number;
  last4?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface PaymentIntegrationProps {
  onPaymentComplete: (paymentData: PaymentResult) => void;
  onCancel: () => void;
}

export default function PaymentIntegration({ onPaymentComplete, onCancel }: PaymentIntegrationProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { summary } = useCart();

  const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    return cleaned.length >= 13 && /^\d+$/.test(cleaned);
  };

  const validateExpiry = (expiry: string) => {
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expiryMonth = parseInt(month);
    const expiryYear = parseInt(year);
    
    if (expiryMonth < 1 || expiryMonth > 12) return false;
    if (expiryYear < currentYear) return false;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
    
    return true;
  };

  const validateCVC = (cvc: string) => {
    return cvc.length >= 3 && /^\d+$/.test(cvc);
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      // Format card number with spaces
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Max length for formatted card number
    } else if (field === 'expiry') {
      // Format expiry as MM/YY
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
      }
      if (formattedValue.length > 5) return;
    } else if (field === 'cvc') {
      // Only allow digits
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (selectedMethod === 'card') {
      if (!cardData.name.trim()) {
        newErrors.name = 'Cardholder name is required';
      }
      
      if (!validateCardNumber(cardData.number)) {
        newErrors.number = 'Please enter a valid card number';
      }
      
      if (!validateExpiry(cardData.expiry)) {
        newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
      }
      
      if (!validateCVC(cardData.cvc)) {
        newErrors.cvc = 'Please enter a valid CVC';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate different payment methods
      if (selectedMethod === 'card') {
        // Simulate card payment
        const paymentResult: PaymentResult = {
          id: `pay_${Date.now()}`,
          method: 'card',
          amount: summary.total,
          last4: cardData.number.slice(-4),
          status: 'completed'
        };
        
        toast.success('Payment successful!');
        onPaymentComplete(paymentResult);
      } else if (selectedMethod === 'apple-pay' || selectedMethod === 'google-pay') {
        // Simulate digital wallet payment
        const paymentResult: PaymentResult = {
          id: `pay_${Date.now()}`,
          method: selectedMethod,
          amount: summary.total,
          status: 'completed'
        };
        
        toast.success('Payment successful!');
        onPaymentComplete(paymentResult);
      } else if (selectedMethod === 'cash') {
        // Cash on delivery
        const paymentResult: PaymentResult = {
          id: `pay_${Date.now()}`,
          method: 'cash',
          amount: summary.total,
          status: 'pending'
        };
        
        toast.success('Order confirmed! Pay on delivery.');
        onPaymentComplete(paymentResult);
      }
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-white">${summary.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
            <span className="text-gray-900 dark:text-white">${summary.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tip</span>
            <span className="text-gray-900 dark:text-white">${summary.tip.toFixed(2)}</span>
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-gray-900 dark:text-white">${summary.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <motion.button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full p-4 border rounded-lg text-left transition-all ${
                selectedMethod === method.id
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div className={`${selectedMethod === method.id ? 'text-orange-500' : 'text-gray-400'}`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{method.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{method.description}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedMethod === method.id
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Card Details Form */}
      {selectedMethod === 'card' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => handleCardInputChange('name', e.target.value)}
              placeholder="John Doe"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle size={12} />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => handleCardInputChange('number', e.target.value)}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.number && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                <AlertCircle size={12} />
                {errors.number}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                value={cardData.expiry}
                onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                placeholder="MM/YY"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.expiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.expiry && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={12} />
                  {errors.expiry}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CVC
              </label>
              <input
                type="text"
                value={cardData.cvc}
                onChange={(e) => handleCardInputChange('cvc', e.target.value)}
                placeholder="123"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.cvc ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.cvc && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                  <AlertCircle size={12} />
                  {errors.cvc}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <Lock size={16} />
        <span>Your payment information is encrypted and secure</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock size={16} />
              Pay ${summary.total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
