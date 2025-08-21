import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, DollarSign, ShoppingBag, Users, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard: React.FC = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
    refetchInterval: 60000, // Refetch every minute
    retry: 1
  });

  const analytics = analyticsData?.success ? analyticsData.data : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const stats = [
    {
      name: 'Total Orders',
      value: analytics?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Revenue',
      value: formatPrice(analytics?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      name: 'Avg Order Value',
      value: formatPrice(analytics?.avgOrderValue || 0),
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+3%'
    },
    {
      name: 'Active Orders',
      value: analytics?.ordersByStatus?.filter((s: any) => 
        ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(s._id)
      ).reduce((sum: number, s: any) => sum + s.count, 0) || 0,
      icon: Clock,
      color: 'bg-purple-500',
      change: '+5%'
    }
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your restaurant performance</p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Items</h2>
            
            {analytics?.topItems?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topItems.slice(0, 5).map((item: any, index: number) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{item._id}</span>
                    </div>
                    <span className="text-sm text-gray-600">{item.count} sold</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </motion.div>

          {/* Order status breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
            
            {analytics?.ordersByStatus?.length > 0 ? (
              <div className="space-y-4">
                {analytics.ordersByStatus.map((status: any) => (
                  <div key={status._id} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 capitalize">
                      {status._id.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{status.count} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </motion.div>
        </div>

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
            >
              View All Orders
            </Link>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-500">Recent orders will appear here</p>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;