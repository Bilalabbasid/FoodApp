import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Truck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

const KitchenDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock orders for demonstration
  const orders = [
    {
      _id: '1',
      orderNo: 'ORD-000001',
      items: [
        { name: 'Margherita Pizza', quantity: 1, selectedVariant: { name: 'Large' }, selectedAddons: [{ name: 'Extra Cheese' }] },
        { name: 'Caesar Salad', quantity: 1, selectedAddons: [{ name: 'Grilled Chicken' }] }
      ],
      status: 'confirmed',
      deliveryMethod: 'delivery',
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      estimatedReadyTime: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
      specialInstructions: 'Extra crispy crust'
    },
    {
      _id: '2',
      orderNo: 'ORD-000002',
      items: [
        { name: 'Classic Cheeseburger', quantity: 2, selectedAddons: [{ name: 'Bacon' }, { name: 'French Fries' }] }
      ],
      status: 'preparing',
      deliveryMethod: 'pickup',
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      estimatedReadyTime: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    },
    {
      _id: '3',
      orderNo: 'ORD-000003',
      items: [
        { name: 'Pepperoni Supreme', quantity: 1, selectedVariant: { name: 'Medium' } }
      ],
      status: 'ready',
      deliveryMethod: 'delivery',
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      estimatedReadyTime: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago (ready)
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'border-blue-500 bg-blue-50';
      case 'preparing':
        return 'border-orange-500 bg-orange-50';
      case 'ready':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'preparing':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeElapsed = (createdAt: Date) => {
    const elapsed = Math.floor((currentTime.getTime() - createdAt.getTime()) / 1000 / 60);
    return `${elapsed}m`;
  };

  const getTimeRemaining = (estimatedTime: Date) => {
    const remaining = Math.floor((estimatedTime.getTime() - currentTime.getTime()) / 1000 / 60);
    if (remaining <= 0) return 'Ready';
    return `${remaining}m`;
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // In a real implementation, this would call the API
    console.log(`Updating order ${orderId} to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kitchen Display System</h1>
              <p className="text-gray-600">TastyCrave Downtown</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`rounded-lg border-2 p-4 ${getStatusColor(order.status)} transition-all duration-300`}
              >
                {/* Order header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 font-bold text-lg">#{order.orderNo.split('-')[1]}</span>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="flex items-center text-gray-600">
                      {order.deliveryMethod === 'delivery' ? (
                        <Truck className="h-4 w-4 mr-1" />
                      ) : (
                        <Clock className="h-4 w-4 mr-1" />
                      )}
                      <span className="capitalize">{order.deliveryMethod}</span>
                    </div>
                    <div className="text-gray-500">
                      {getTimeElapsed(order.createdAt)} elapsed
                    </div>
                  </div>
                </div>

                {/* Order items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.quantity}x {item.name}
                          </h3>
                          {item.selectedVariant && (
                            <p className="text-sm text-gray-600">{item.selectedVariant.name}</p>
                          )}
                          {item.selectedAddons.length > 0 && (
                            <p className="text-sm text-gray-600">
                              + {item.selectedAddons.map(a => a.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special instructions */}
                {order.specialInstructions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800 font-medium">Special Instructions:</p>
                    <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                  </div>
                )}

                {/* Time info */}
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-gray-600">Ready in:</span>
                  <span className={`font-bold ${
                    getTimeRemaining(order.estimatedReadyTime) === 'Ready' 
                      ? 'text-green-600' 
                      : 'text-gray-900'
                  }`}>
                    {getTimeRemaining(order.estimatedReadyTime)}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'preparing')}
                      className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Start Preparing
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'ready')}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Mark Ready
                    </button>
                  )}
                  
                  {order.status === 'ready' && order.deliveryMethod === 'delivery' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'out_for_delivery')}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Out for Delivery
                    </button>
                  )}
                  
                  {order.status === 'ready' && order.deliveryMethod === 'pickup' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'picked_up')}
                      className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                    >
                      Mark Picked Up
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h2>
            <p className="text-gray-600">No pending orders at the moment</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;