import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, MapPin, CreditCard, Clock, Star, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AccountPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['userOrders'],
    queryFn: () => api.getUserOrders(1, 10),
    enabled: !!user,
    retry: 1
  });

  const orders = ordersData?.success ? ordersData.data || [] : [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Order History', icon: Clock },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'loyalty', label: 'Loyalty Points', icon: Star }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <nav className="bg-white rounded-lg shadow-md p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-3" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={user.phone || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="No phone number on file"
                  />
                </div>

                <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* Orders tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
              
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Start by placing your first order!</p>
                  <Link
                    to="/menu"
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">Order #{order.orderNo}</h3>
                          <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' || order.status === 'picked_up'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {formatPrice(order.pricing.total)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                        <p className="capitalize">{order.deliveryMethod}</p>
                      </div>

                      <div className="mt-3 flex space-x-3">
                        <Link
                          to={`/order/${order.orderNo}`}
                          className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          View Details
                        </Link>
                        {(order.status === 'delivered' || order.status === 'picked_up') && (
                          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Addresses</h2>
              
              {user.addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                  <p className="text-gray-600 mb-4">Add an address to make checkout faster</p>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.addresses.map((address, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="font-medium text-gray-900 capitalize">{address.type}</h3>
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {address.street}<br />
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          {address.instructions && (
                            <p className="text-gray-500 text-sm mt-1">
                              Instructions: {address.instructions}
                            </p>
                          )}
                        </div>
                        <button className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-colors">
                    + Add New Address
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loyalty points tab */}
          {activeTab === 'loyalty' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Loyalty Points</h2>
              
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                  <Star className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{user.loyaltyPoints}</h3>
                <p className="text-gray-600 mb-6">Points Available</p>
                
                <div className="bg-orange-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-orange-800">
                    Earn 1 point for every $1 spent. Redeem 100 points for $5 off your next order!
                  </p>
                </div>

                <button 
                  disabled={user.loyaltyPoints < 100}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Redeem Points
                </button>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {(activeTab === 'payment' || activeTab === 'settings') && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {activeTab === 'payment' ? 'Payment Methods' : 'Settings'}
              </h2>
              
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600">This feature will be available in a future update</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AccountPage;