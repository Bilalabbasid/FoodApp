import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Plus,
  Edit,
  Eye,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickStat {
  label: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

export const QuickActionsPanel: React.FC = () => {
  const quickStats: QuickStat[] = [
    {
      label: 'Total Orders',
      value: 156,
      change: '+12%',
      changeType: 'positive',
      icon: <ShoppingCart className="h-6 w-6" />
    },
    {
      label: 'Menu Items',
      value: 49,
      change: '+3',
      changeType: 'positive',
      icon: <Package className="h-6 w-6" />
    },
    {
      label: 'Active Users',
      value: 342,
      change: '+8%',
      changeType: 'positive',
      icon: <Users className="h-6 w-6" />
    },
    {
      label: 'Revenue',
      value: '$2,340',
      change: '+15%',
      changeType: 'positive',
      icon: <TrendingUp className="h-6 w-6" />
    }
  ];

  const quickActions: QuickAction[] = [
    {
      label: 'Add Menu Item',
      href: '/admin/menu',
      icon: <Plus className="h-5 w-5" />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'View Orders',
      href: '/admin/orders',
      icon: <Eye className="h-5 w-5" />,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Edit Menu',
      href: '/admin/menu',
      icon: <Edit className="h-5 w-5" />,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      label: 'Reviews',
      href: '/admin/reviews',
      icon: <Star className="h-5 w-5" />,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const getChangeColor = (type: QuickStat['changeType']) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <div className="text-orange-600 dark:text-orange-400">
                      {stat.icon}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.href}
                className={`block p-4 rounded-lg text-white text-center transition-all duration-200 transform hover:scale-105 ${action.color}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  {action.icon}
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-3">
            {[
              { action: 'New order #1234', time: '2 minutes ago', type: 'order' },
              { action: 'Pizza Margherita updated', time: '10 minutes ago', type: 'menu' },
              { action: 'Customer John D. registered', time: '15 minutes ago', type: 'user' },
              { action: 'Order #1233 completed', time: '23 minutes ago', type: 'order' },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'order' ? 'bg-green-500' :
                    activity.type === 'menu' ? 'bg-blue-500' : 'bg-purple-500'
                  }`} />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {activity.action}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
