import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../utils/api';

interface RiderLocation {
  lat: number;
  lng: number;
  address?: string;
  timestamp: Date;
}

interface DeliveryOrder {
  _id: string;
  orderNo: string;
  status: 'assigned' | 'picked_up' | 'en_route' | 'delivered';
  customer: {
    name: string;
    phone: string;
    address: string;
    location: RiderLocation;
    notes?: string;
  };
  store: {
    name: string;
    address: string;
    location: RiderLocation;
    phone: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryFee: number;
  estimatedDeliveryTime: Date;
  scheduledPickupTime: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  distance: number; // in km
  specialInstructions?: string;
  paymentMethod: 'cash' | 'card' | 'online';
  isPrePaid: boolean;
  riderEarnings: number;
}

interface RiderMetrics {
  totalDeliveries: number;
  todayDeliveries: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalRatings: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
  completionRate: number;
  activeHours: number;
  totalDistance: number; // in km
}

interface RiderShift {
  _id: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'break' | 'completed';
  earnings: number;
  deliveries: number;
  totalDistance: number;
  averageRating: number;
}

export const useRider = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [metrics, setMetrics] = useState<RiderMetrics | null>(null);
  const [currentShift, setCurrentShift] = useState<RiderShift | null>(null);
  const [currentLocation, setCurrentLocation] = useState<RiderLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has rider access
  const hasRiderAccess = user && ['rider', 'admin'].includes(user.roles?.[0] || '');

  // Fetch assigned orders
  const fetchOrders = async (params?: {
    status?: string;
    limit?: number;
    radius?: number;
  }) => {
    if (!hasRiderAccess) {
      throw new Error('Unauthorized: Rider access required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.ridersApp.getOrders(params);
      setOrders(response.data.data);
      
      // Set current order (most recent assigned/picked_up/en_route)
      const active = response.data.data.find((order: DeliveryOrder) => 
        ['assigned', 'picked_up', 'en_route'].includes(order.status)
      );
      setCurrentOrder(active || null);
      
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch delivery orders';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (
    orderId: string,
    status: 'picked_up' | 'en_route' | 'delivered',
    data?: {
      location?: RiderLocation;
      notes?: string;
      deliveryProof?: string; // photo URL
      customerSignature?: string;
      cashCollected?: number;
    }
  ) => {
    if (!hasRiderAccess) {
      throw new Error('Unauthorized: Rider access required');
    }

    try {
      const response = await api.ridersApp.updateOrderStatus(orderId, status, data);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId 
            ? { 
                ...order, 
                status,
                ...(status === 'picked_up' ? { actualPickupTime: new Date() } : {}),
                ...(status === 'delivered' ? { actualDeliveryTime: new Date() } : {}),
              }
            : order
        )
      );

      // Update current order
      if (currentOrder?._id === orderId) {
        if (status === 'delivered') {
          setCurrentOrder(null);
        } else {
          setCurrentOrder(prev => prev ? { ...prev, status } : null);
        }
      }

      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Accept delivery order
  const acceptOrder = async (orderId: string) => {
    if (!hasRiderAccess) {
      throw new Error('Unauthorized: Rider access required');
    }

    try {
      const response = await api.ridersApp.acceptOrder(orderId);
      
      // Add to local orders and set as current
      const newOrder = response.data.data;
      setOrders(prev => [newOrder, ...prev.filter(o => o._id !== orderId)]);
      setCurrentOrder(newOrder);
      
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to accept order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Decline delivery order
  const declineOrder = async (orderId: string, reason: string) => {
    if (!hasRiderAccess) {
      throw new Error('Unauthorized: Rider access required');
    }

    try {
      const response = await api.ridersApp.declineOrder(orderId, reason);
      
      // Remove from local orders
      setOrders(prev => prev.filter(o => o._id !== orderId));
      
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to decline order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update rider location
  const updateLocation = async (location: Omit<RiderLocation, 'timestamp'>) => {
    if (!hasRiderAccess) {
      throw new Error('Unauthorized: Rider access required');
    }

    try {
      const locationWithTimestamp = { ...location, timestamp: new Date() };
      const response = await api.ridersApp.updateLocation(locationWithTimestamp);
      setCurrentLocation(locationWithTimestamp);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to update location';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Fetch rider metrics
  const fetchMetrics = async (params?: {
    from?: string;
    to?: string;
  }) => {
    if (!hasRiderAccess) {
      throw new Error('Unauthorized: Rider access required');
    }

    try {
      const response = await api.ridersApp.getMetrics(params);
      setMetrics(response.data.data);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to fetch rider metrics';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Shift management
  const shiftActions = {
    start: async (location: Omit<RiderLocation, 'timestamp'>) => {
      if (!hasRiderAccess) {
        throw new Error('Unauthorized: Rider access required');
      }

      try {
        const response = await api.ridersApp.startShift(location);
        setCurrentShift(response.data.data);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to start shift';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    end: async (location: Omit<RiderLocation, 'timestamp'>) => {
      if (!hasRiderAccess) {
        throw new Error('Unauthorized: Rider access required');
      }

      try {
        const response = await api.ridersApp.endShift(location);
        setCurrentShift(null);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to end shift';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    takeBreak: async (duration: number) => {
      if (!hasRiderAccess) {
        throw new Error('Unauthorized: Rider access required');
      }

      try {
        const response = await api.ridersApp.takeBreak(duration);
        setCurrentShift(prev => prev ? { ...prev, status: 'break' } : null);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to take break';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },

    resumeWork: async () => {
      if (!hasRiderAccess) {
        throw new Error('Unauthorized: Rider access required');
      }

      try {
        const response = await api.ridersApp.resumeWork();
        setCurrentShift(prev => prev ? { ...prev, status: 'active' } : null);
        return response.data;
      } catch (err: unknown) {
        const errorMessage = (err as any)?.response?.data?.message || 'Failed to resume work';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
  };

  // Get navigation to destination
  const getNavigation = async (destination: 'store' | 'customer') => {
    if (!currentOrder || !currentLocation) {
      throw new Error('No active order or current location');
    }

    try {
      // This would integrate with Google Maps API
      const targetLocation = destination === 'store' 
        ? currentOrder.store.location 
        : currentOrder.customer.location;

      // For now, return a placeholder
      return {
        success: false,
        message: 'Google Maps API key required for navigation',
        data: {
          from: currentLocation,
          to: targetLocation,
          estimatedTime: '15-20 minutes',
          distance: '5.2 km'
        }
      };
    } catch (err: unknown) {
      const errorMessage = (err as any)?.message || 'Failed to get navigation';
      throw new Error(errorMessage);
    }
  };

  // Report delivery issue
  const reportIssue = async (issueData: {
    orderId: string;
    type: 'customer_not_available' | 'wrong_address' | 'damaged_order' | 'payment_issue' | 'other';
    description: string;
    location?: RiderLocation;
    photo?: string;
  }) => {
    if (!hasRiderAccess) {
      throw new Error('Unauthorized: Rider access required');
    }

    try {
      const response = await api.ridersApp.reportIssue(issueData);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = (err as any)?.response?.data?.message || 'Failed to report issue';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get current shift status
  const getCurrentShift = async () => {
    if (!hasRiderAccess) {
      throw new Error('Unauthorized: Rider access required');
    }

    try {
      const response = await api.ridersApp.getCurrentShift();
      setCurrentShift(response.data.data);
      return response.data;
    } catch (err: unknown) {
      // Rider might not have an active shift
      setCurrentShift(null);
      return { data: null };
    }
  };

  // Auto location tracking (when on duty)
  useEffect(() => {
    if (!hasRiderAccess || !currentShift || currentShift.status !== 'active') return;

    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        updateLocation(location);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    );

    return () => {
      if (watchId) {
        navigator.geolocation?.clearWatch(watchId);
      }
    };
  }, [hasRiderAccess, currentShift?.status]);

  // Auto-fetch data on mount
  useEffect(() => {
    if (hasRiderAccess) {
      fetchOrders();
      fetchMetrics();
      getCurrentShift();
    }
  }, [hasRiderAccess]);

  return {
    orders,
    currentOrder,
    metrics,
    currentShift,
    currentLocation,
    loading,
    error,
    hasRiderAccess,
    
    // Actions
    fetchOrders,
    updateOrderStatus,
    acceptOrder,
    declineOrder,
    updateLocation,
    fetchMetrics,
    shiftActions,
    getNavigation,
    reportIssue,
    getCurrentShift,
    
    // Computed values
    availableOrders: orders.filter(o => o.status === 'assigned'),
    activeDeliveries: orders.filter(o => ['picked_up', 'en_route'].includes(o.status)),
    completedToday: orders.filter(o => 
      o.status === 'delivered' && 
      new Date(o.actualDeliveryTime || '').toDateString() === new Date().toDateString()
    ),
    
    // Status checks
    isOnDuty: currentShift?.status === 'active',
    isOnBreak: currentShift?.status === 'break',
    hasActiveDelivery: !!currentOrder,
    canAcceptOrders: currentShift?.status === 'active' && !currentOrder,
  };
};
