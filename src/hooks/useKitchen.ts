import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../utils/api';

interface KitchenOrder {
  _id: string;
  orderNo: string;
  status: 'confirmed' | 'preparing' | 'ready';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  items: Array<{
    name: string;
    quantity: number;
    selectedVariant?: { name: string };
    selectedAddons: Array<{ name: string }>;
    specialInstructions?: string;
  }>;
  specialInstructions?: string;
  estimatedPrepTime: number;
  createdAt: Date;
  estimatedReadyTime: Date;
  deliveryMethod: 'delivery' | 'pickup';
  storeId: string;
}

interface KitchenMetrics {
  averagePrepTime: number;
  totalOrdersPrepared: number;
  onTimeDeliveryRate: number;
  activeOrders: {
    confirmed: number;
    preparing: number;
    ready: number;
  };
  staffPerformance: Array<{
    staffId: string;
    name: string;
    ordersPrepared: number;
    averagePrepTime: number;
    rating: number;
  }>;
}

export const useKitchen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [metrics, setMetrics] = useState<KitchenMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has kitchen access
  const hasKitchenAccess = user && ['staff', 'manager', 'admin'].includes(user.role || '');

  // Fetch kitchen orders
  const fetchOrders = async (params?: {
    status?: string;
    priority?: string;
    limit?: number;
  }) => {
    if (!hasKitchenAccess) {
      throw new Error('Unauthorized: Kitchen access required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.kitchen.getOrders(params);
      setOrders(response.data.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch kitchen orders';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    status: 'preparing' | 'ready',
    data?: {
      estimatedReadyTime?: string;
      notes?: string;
    }
  ) => {
    if (!hasKitchenAccess) {
      throw new Error('Unauthorized: Kitchen access required');
    }

    try {
      const response = await api.kitchen.updateOrderStatus(orderId, status, data);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId 
            ? { ...order, status, ...data }
            : order
        ).filter(order => 
          // Remove orders that are no longer kitchen-relevant
          ['confirmed', 'preparing', 'ready'].includes(order.status)
        )
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fetch kitchen metrics (manager/admin only)
  const fetchMetrics = async (params?: {
    from?: string;
    to?: string;
    storeId?: string;
  }) => {
    if (!user || !['manager', 'admin'].includes(user.role || '')) {
      throw new Error('Unauthorized: Manager/Admin access required');
    }

    try {
      const response = await api.kitchen.getMetrics(params);
      setMetrics(response.data.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch kitchen metrics';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update item preparation time
  const updateItemPrepTime = async (itemId: string, preparationTime: number) => {
    if (!hasKitchenAccess) {
      throw new Error('Unauthorized: Kitchen access required');
    }

    try {
      const response = await api.kitchen.updateItemPrepTime(itemId, preparationTime);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update preparation time';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update item stock status
  const updateItemStock = async (
    itemId: string,
    isAvailable: boolean,
    reason?: string
  ) => {
    if (!hasKitchenAccess) {
      throw new Error('Unauthorized: Kitchen access required');
    }

    try {
      const response = await api.kitchen.updateItemStock(itemId, isAvailable, reason);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update item availability';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Staff shift management
  const staffShifts = {
    get: async (params?: { staffId?: string; date?: string }) => {
      if (!hasKitchenAccess) {
        throw new Error('Unauthorized: Kitchen access required');
      }

      try {
        const response = await api.kitchen.getStaffShifts(params);
        return response.data.data;
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to fetch staff shifts');
      }
    },

    clockInOut: async (action: 'in' | 'out', notes?: string) => {
      if (!hasKitchenAccess) {
        throw new Error('Unauthorized: Kitchen access required');
      }

      try {
        const response = await api.kitchen.clockInOut(action, notes);
        return response.data;
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to clock in/out');
      }
    },
  };

  // Report kitchen issues
  const reportIssue = async (issueData: {
    type: 'equipment' | 'supply' | 'safety' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    description: string;
    equipment?: string;
  }) => {
    if (!hasKitchenAccess) {
      throw new Error('Unauthorized: Kitchen access required');
    }

    try {
      const response = await api.kitchen.reportIssue(issueData);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to report issue';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Real-time order updates via socket
  useEffect(() => {
    if (!hasKitchenAccess) return;

    // In a real implementation, this would connect to Socket.IO
    // and listen for kitchen-specific events
    const handleNewOrder = (order: KitchenOrder) => {
      if (order.status === 'confirmed') {
        setOrders(prev => [order, ...prev]);
      }
    };

    const handleOrderUpdate = (data: { orderId: string; status: string }) => {
      setOrders(prev => 
        prev.map(order => 
          order._id === data.orderId 
            ? { ...order, status: data.status as any }
            : order
        ).filter(order => 
          ['confirmed', 'preparing', 'ready'].includes(order.status)
        )
      );
    };

    // Mock real-time updates
    console.log('Kitchen real-time updates enabled');

    return () => {
      console.log('Kitchen real-time updates disabled');
    };
  }, [hasKitchenAccess]);

  // Auto-fetch orders on mount
  useEffect(() => {
    if (hasKitchenAccess) {
      fetchOrders();
    }
  }, [hasKitchenAccess]);

  return {
    orders,
    metrics,
    loading,
    error,
    hasKitchenAccess,
    
    // Actions
    fetchOrders,
    updateOrderStatus,
    fetchMetrics,
    updateItemPrepTime,
    updateItemStock,
    staffShifts,
    reportIssue,
    
    // Computed values
    pendingOrders: orders.filter(o => o.status === 'confirmed'),
    preparingOrders: orders.filter(o => o.status === 'preparing'),
    readyOrders: orders.filter(o => o.status === 'ready'),
    
    // Permission checks
    canManageKitchen: user ? ['manager', 'admin'].includes(user.role || '') : false,
    canViewMetrics: user ? ['manager', 'admin'].includes(user.role || '') : false,
  };
};
