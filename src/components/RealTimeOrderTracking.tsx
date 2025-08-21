import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Utensils, Truck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderStatus {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  timestamp?: string;
  estimatedTime?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'picked-up' | 'out-for-delivery' | 'delivered';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  estimatedDeliveryTime: string;
  deliveryAddress?: string;
  phone: string;
}

interface RealTimeOrderTrackingProps {
  orderId: string;
}

export default function RealTimeOrderTracking({ orderId }: RealTimeOrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate real-time order updates
  useEffect(() => {
    // Load initial order data
    const loadOrder = () => {
      // Simulate API call
      setTimeout(() => {
        const mockOrder: Order = {
          id: orderId,
          orderNumber: `ORD-${orderId.slice(-6).toUpperCase()}`,
          status: 'placed',
          items: [
            { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
            { name: 'Caesar Salad', quantity: 1, price: 8.99 },
            { name: 'Garlic Bread', quantity: 2, price: 4.99 }
          ],
          total: 31.97,
          estimatedDeliveryTime: new Date(Date.now() + 35 * 60000).toISOString(),
          deliveryAddress: '123 Main Street, Apt 4B, New York, NY 10001',
          phone: '(555) 123-4567'
        };
        setOrder(mockOrder);
        setIsLoading(false);
      }, 1000);
    };

    loadOrder();

    // Simulate real-time status updates
    const statusUpdates = [
      { step: 1, delay: 3000, status: 'confirmed' as const },
      { step: 2, delay: 8000, status: 'preparing' as const },
      { step: 3, delay: 20000, status: 'ready' as const },
      { step: 4, delay: 25000, status: 'out-for-delivery' as const },
      { step: 5, delay: 35000, status: 'delivered' as const }
    ];

    const timeouts = statusUpdates.map(({ step, delay, status }) =>
      setTimeout(() => {
        setCurrentStep(step);
        setOrder(prev => prev ? { ...prev, status } : null);
      }, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Order not found</div>
      </div>
    );
  }

  const orderStatuses: OrderStatus[] = [
    {
      id: 'placed',
      name: 'Order Placed',
      description: 'Your order has been received',
      icon: <CheckCircle size={20} />,
      completed: currentStep >= 0,
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'confirmed',
      name: 'Order Confirmed',
      description: 'Restaurant has confirmed your order',
      icon: <CheckCircle size={20} />,
      completed: currentStep >= 1,
      timestamp: currentStep >= 1 ? new Date(Date.now() - (currentStep - 1) * 60000).toLocaleTimeString() : undefined,
    },
    {
      id: 'preparing',
      name: 'Preparing',
      description: 'Your food is being prepared',
      icon: <Utensils size={20} />,
      completed: currentStep >= 2,
      timestamp: currentStep >= 2 ? new Date(Date.now() - (currentStep - 2) * 60000).toLocaleTimeString() : undefined,
      estimatedTime: currentStep === 2 ? '15-20 minutes' : undefined
    },
    {
      id: 'ready',
      name: 'Ready for Pickup',
      description: 'Your order is ready',
      icon: <CheckCircle size={20} />,
      completed: currentStep >= 3,
      timestamp: currentStep >= 3 ? new Date(Date.now() - (currentStep - 3) * 60000).toLocaleTimeString() : undefined,
    },
    {
      id: 'out-for-delivery',
      name: 'Out for Delivery',
      description: 'Driver is on the way',
      icon: <Truck size={20} />,
      completed: currentStep >= 4,
      timestamp: currentStep >= 4 ? new Date(Date.now() - (currentStep - 4) * 60000).toLocaleTimeString() : undefined,
      estimatedTime: currentStep === 4 ? '10-15 minutes' : undefined
    },
    {
      id: 'delivered',
      name: 'Delivered',
      description: 'Order has been delivered',
      icon: <MapPin size={20} />,
      completed: currentStep >= 5,
      timestamp: currentStep >= 5 ? new Date().toLocaleTimeString() : undefined,
    }
  ];

  const formatEstimatedTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Order Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Estimated delivery: {formatEstimatedTime(order.estimatedDeliveryTime)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-500">
              ${order.total.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {order.deliveryAddress && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MapPin size={16} className="text-gray-500 dark:text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Delivery Address</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{order.deliveryAddress}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{order.phone}</div>
            </div>
          </div>
        )}
      </div>

      {/* Order Tracking */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Order Tracking
        </h2>

        <div className="space-y-4">
          {orderStatuses.map((status, index) => (
            <motion.div
              key={status.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4"
            >
              {/* Status Icon */}
              <div className="relative">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    status.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStep
                      ? 'bg-orange-500 border-orange-500 text-white animate-pulse'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}
                >
                  {status.completed ? <CheckCircle size={20} /> : 
                   index === currentStep ? (
                     <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                   ) : status.icon}
                </div>
                
                {/* Connecting Line */}
                {index < orderStatuses.length - 1 && (
                  <div
                    className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 transition-colors ${
                      status.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>

              {/* Status Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-3 mb-1">
                  <h3
                    className={`font-medium ${
                      status.completed ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {status.name}
                  </h3>
                  {status.timestamp && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {status.timestamp}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {status.description}
                </p>
                
                {status.estimatedTime && index === currentStep && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <Clock size={14} />
                    <span>Estimated time: {status.estimatedTime}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Order Items
        </h2>
        
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <div className="flex items-center gap-3">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {item.quantity}
                </span>
                <span className="text-gray-900 dark:text-white">{item.name}</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        
        <div className="flex justify-between items-center font-semibold text-lg">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Need Help?
        </h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Restaurant Phone:</span>
            <a href="tel:+1234567890" className="text-orange-500 hover:text-orange-600">
              (123) 456-7890
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Support:</span>
            <a href="mailto:support@restaurant.com" className="text-orange-500 hover:text-orange-600">
              support@restaurant.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
