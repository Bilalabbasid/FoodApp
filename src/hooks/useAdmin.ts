import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../utils/api';

interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalStores: number;
  totalRiders: number;
  avgOrderValue: number;
  conversionRate: number;
  customerSatisfaction: number;
  revenueGrowth: number;
  orderGrowth: number;
  activeCustomers: number;
  newCustomersToday: number;
}

interface RevenueData {
  labels: string[];
  revenue: number[];
  orders: number[];
  avgOrderValue: number[];
}

interface TopItems {
  _id: string;
  name: string;
  totalSold: number;
  revenue: number;
  image?: string;
  store: {
    name: string;
    id: string;
  };
}

interface StorePerformance {
  _id: string;
  name: string;
  totalOrders: number;
  revenue: number;
  avgRating: number;
  totalRatings: number;
  status: 'active' | 'inactive';
  isOpen: boolean;
}

interface SystemHealth {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastBackup: Date;
}

interface PendingApprovals {
  stores: Array<{
    _id: string;
    name: string;
    owner: string;
    submittedAt: Date;
    status: 'pending';
  }>;
  riders: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    vehicleType: string;
    submittedAt: Date;
    status: 'pending';
  }>;
  withdrawals: Array<{
    _id: string;
    user: {
      name: string;
      email: string;
    };
    amount: number;
    method: string;
    submittedAt: Date;
    status: 'pending';
  }>;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [topItems, setTopItems] = useState<TopItems[]>([]);
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has admin access
  const hasAdminAccess = user && user.roles?.includes('admin');

  // Fetch dashboard metrics
  const fetchMetrics = async (params?: {
    from?: string;
    to?: string;
    storeId?: string;
  }) => {
    if (!hasAdminAccess) {
      throw new Error('Unauthorized: Admin access required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.admin.getMetrics(params);
      setMetrics(response.data.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch admin metrics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue analytics
  const fetchRevenueData = async (params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    from?: string;
    to?: string;
    storeId?: string;
  }) => {
    if (!hasAdminAccess) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const response = await api.admin.getRevenueAnalytics(params);
      setRevenueData(response.data.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch revenue data';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fetch top performing items
  const fetchTopItems = async (params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    storeId?: string;
    limit?: number;
  }) => {
    if (!hasAdminAccess) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const response = await api.admin.getTopItems(params);
      setTopItems(response.data.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch top items';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fetch store performance data
  const fetchStorePerformance = async (params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    sortBy?: 'revenue' | 'orders' | 'rating';
    limit?: number;
  }) => {
    if (!hasAdminAccess) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const response = await api.admin.getStorePerformance(params);
      setStorePerformance(response.data.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch store performance';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fetch system health
  const fetchSystemHealth = async () => {
    if (!hasAdminAccess) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const response = await api.admin.getSystemHealth();
      setSystemHealth(response.data.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch system health';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    if (!hasAdminAccess) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const response = await api.admin.getPendingApprovals();
      setPendingApprovals(response.data.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch pending approvals';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Store management
  const storeActions = {
    approve: async (storeId: string, approvalData?: any) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.approveStore(storeId, approvalData);
        
        // Update pending approvals
        setPendingApprovals(prev => prev ? {
          ...prev,
          stores: prev.stores.filter(store => store._id !== storeId)
        } : null);
        
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to approve store';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    reject: async (storeId: string, reason: string) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.rejectStore(storeId, reason);
        
        // Update pending approvals
        setPendingApprovals(prev => prev ? {
          ...prev,
          stores: prev.stores.filter(store => store._id !== storeId)
        } : null);
        
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to reject store';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    suspend: async (storeId: string, reason: string) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.suspendStore(storeId, reason);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to suspend store';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    reactivate: async (storeId: string) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.reactivateStore(storeId);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to reactivate store';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
  };

  // Rider management
  const riderActions = {
    approve: async (riderId: string, approvalData?: any) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.approveRider(riderId, approvalData);
        
        // Update pending approvals
        setPendingApprovals(prev => prev ? {
          ...prev,
          riders: prev.riders.filter(rider => rider._id !== riderId)
        } : null);
        
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to approve rider';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    reject: async (riderId: string, reason: string) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.rejectRider(riderId, reason);
        
        // Update pending approvals
        setPendingApprovals(prev => prev ? {
          ...prev,
          riders: prev.riders.filter(rider => rider._id !== riderId)
        } : null);
        
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to reject rider';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    suspend: async (riderId: string, reason: string) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.suspendRider(riderId, reason);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to suspend rider';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
  };

  // Financial management
  const financialActions = {
    approveWithdrawal: async (withdrawalId: string) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.approveWithdrawal(withdrawalId);
        
        // Update pending approvals
        setPendingApprovals(prev => prev ? {
          ...prev,
          withdrawals: prev.withdrawals.filter(w => w._id !== withdrawalId)
        } : null);
        
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to approve withdrawal';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    rejectWithdrawal: async (withdrawalId: string, reason: string) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.rejectWithdrawal(withdrawalId, reason);
        
        // Update pending approvals
        setPendingApprovals(prev => prev ? {
          ...prev,
          withdrawals: prev.withdrawals.filter(w => w._id !== withdrawalId)
        } : null);
        
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to reject withdrawal';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    getFinancialReports: async (params?: {
      type?: 'revenue' | 'commissions' | 'withdrawals';
      from?: string;
      to?: string;
      storeId?: string;
    }) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.getFinancialReports(params);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch financial reports';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
  };

  // System management
  const systemActions = {
    updateSettings: async (settings: any) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.updateSystemSettings(settings);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to update system settings';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    sendNotification: async (notificationData: {
      type: 'all' | 'customers' | 'stores' | 'riders';
      title: string;
      message: string;
      userIds?: string[];
    }) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.sendNotification(notificationData);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to send notification';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    exportData: async (params: {
      type: 'users' | 'orders' | 'stores' | 'riders' | 'revenue';
      format: 'csv' | 'excel' | 'pdf';
      from?: string;
      to?: string;
      filters?: any;
    }) => {
      if (!hasAdminAccess) {
        throw new Error('Unauthorized: Admin access required');
      }

      try {
        const response = await api.admin.exportData(params);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to export data';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
  };

  // Auto-fetch data on mount
  useEffect(() => {
    if (hasAdminAccess) {
      const fetchDashboardData = async () => {
        try {
          await Promise.all([
            fetchMetrics(),
            fetchRevenueData(),
            fetchTopItems(),
            fetchStorePerformance(),
            fetchSystemHealth(),
            fetchPendingApprovals(),
          ]);
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
        }
      };

      fetchDashboardData();
    }
  }, [hasAdminAccess]);

  return {
    metrics,
    revenueData,
    topItems,
    storePerformance,
    systemHealth,
    pendingApprovals,
    loading,
    error,
    hasAdminAccess,
    
    // Actions
    fetchMetrics,
    fetchRevenueData,
    fetchTopItems,
    fetchStorePerformance,
    fetchSystemHealth,
    fetchPendingApprovals,
    
    // Management actions
    storeActions,
    riderActions,
    financialActions,
    systemActions,
    
    // Computed values
    totalPendingApprovals: pendingApprovals ? 
      pendingApprovals.stores.length + 
      pendingApprovals.riders.length + 
      pendingApprovals.withdrawals.length : 0,
    
    criticalAlerts: systemHealth ? [
      ...(systemHealth.errorRate > 5 ? ['High error rate detected'] : []),
      ...(systemHealth.responseTime > 2000 ? ['Slow response times'] : []),
      ...(systemHealth.memoryUsage > 80 ? ['High memory usage'] : []),
      ...(systemHealth.cpuUsage > 80 ? ['High CPU usage'] : []),
      ...(systemHealth.diskUsage > 85 ? ['Low disk space'] : []),
    ] : [],
    
    isSystemHealthy: systemHealth ? 
      systemHealth.errorRate < 5 && 
      systemHealth.responseTime < 2000 && 
      systemHealth.memoryUsage < 80 && 
      systemHealth.cpuUsage < 80 && 
      systemHealth.diskUsage < 85 : false,
  };
};
