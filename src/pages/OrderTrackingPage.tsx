import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock, Truck, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderTrackingPage: React.FC = () => {
  const { orderNo } = useParams<{ orderNo: string }>();

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', orderNo],
    queryFn: () => api.getOrder(orderNo!),
    enabled: !!orderNo,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    retry: 1
  });

  const order = orderData?.success ? orderData.data : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusSteps = () => {
    const baseSteps = [
      { key: 'pending', label: 'Order Placed', icon: CheckCircle },
      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
      { key: 'preparing', label: 'Preparing', icon: Clock },
    ];

    if (order?.deliveryMethod === 'delivery') {
      return [
        ...baseSteps,
        { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle }
      ];
    } else {
      return [
        ...baseSteps,
        { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle },
        { key: 'picked_up', label: 'Picked Up', icon: CheckCircle }
      ];
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    
    const steps = getStatusSteps();
    const currentIndex = steps.findIndex(step => step.key === order.status);
    return currentIndex === -1 ? 0 : currentIndex;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or may have been cancelled</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNo}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'delivered' || order.status === 'picked_up'
                ? 'bg-green-100 text-green-800'
                : order.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order progress */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h2>
            
            <div className="space-y-6">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const timelineItem = order.timeline.find(t => t.status === step.key);
                
                return (
                  <div key={step.key} className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </h3>
                        {timelineItem && (
                          <span className="text-sm text-gray-500">
                            {formatTime(timelineItem.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      {timelineItem?.note && (
                        <p className="text-sm text-gray-600 mt-1">{timelineItem.note}</p>
                      )}
                      
                      {isCurrent && !timelineItem && (
                        <div className="flex items-center mt-1">
                          <div className="animate-spin rounded-full h-3 w-3 border border-orange-500 border-t-transparent mr-2" />
                          <span className="text-sm text-orange-600">In progress...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Delivery info */}
          {order.deliveryMethod === 'delivery' && order.deliveryAddress && (
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
              
              <div className="text-gray-600">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                {order.deliveryAddress.instructions && (
                  <p className="mt-2 text-sm italic">
                    Instructions: {order.deliveryAddress.instructions}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Order details sidebar */}
        <div className="space-y-6">
          {/* Store info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-gray-900">{order.storeId.name}</h4>
                <p className="text-gray-600">
                  {order.storeId.address.street}<br />
                  {order.storeId.address.city}, {order.storeId.address.state} {order.storeId.address.zipCode}
                </p>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{order.storeId.phone}</span>
              </div>
            </div>
          </motion.div>

          {/* Order items */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.selectedVariant && (
                      <p className="text-gray-600">{item.selectedVariant.name}</p>
                    )}
                    {item.selectedAddons.length > 0 && (
                      <p className="text-gray-600">
                        + {item.selectedAddons.map((a: any) => a.name).join(', ')}
                      </p>
                    )}
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900 ml-4">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing summary */}
            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.pricing.subtotal)}</span>
              </div>
              
              {order.pricing.discounts.map((discount: any, index: number) => (
                <div key={index} className="flex justify-between text-green-600">
                  <span>{discount.name}</span>
                  <span>-{formatPrice(discount.amount)}</span>
                </div>
              ))}
              
              {order.pricing.taxes.map((tax: any, index: number) => (
                <div key={index} className="flex justify-between text-gray-600">
                  <span>{tax.name}</span>
                  <span>{formatPrice(tax.amount)}</span>
                </div>
              ))}
              
              {order.pricing.fees.map((fee: any, index: number) => (
                <div key={index} className="flex justify-between text-gray-600">
                  <span>{fee.name}</span>
                  <span>{formatPrice(fee.amount)}</span>
                </div>
              ))}
              
              {order.pricing.deliveryFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(order.pricing.deliveryFee)}</span>
                </div>
              )}
              
              {order.pricing.tip > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tip</span>
                  <span>{formatPrice(order.pricing.tip)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.pricing.total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Estimated time */}
          {order.estimatedReadyTime && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-orange-50 rounded-lg p-6 border border-orange-200"
            >
              <div className="flex items-center text-orange-800">
                <Clock className="h-5 w-5 mr-2" />
                <div>
                  <h3 className="font-semibold">Estimated Ready Time</h3>
                  <p className="text-sm">
                    {new Date(order.estimatedReadyTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact support */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${order.storeId.phone}`}
                className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Store: {order.storeId.phone}
              </a>
              
              <a
                href="mailto:support@tastycrave.com"
                className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;