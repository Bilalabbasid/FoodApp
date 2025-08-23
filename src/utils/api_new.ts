import { toast } from 'sonner';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.api.post('/auth/login', credentials),
    
    register: (userData: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: string;
    }) => this.api.post('/auth/register', userData),
    
    logout: () => this.api.post('/auth/logout'),
    
    refreshToken: () => this.api.post('/auth/refresh'),
    
    forgotPassword: (email: string) =>
      this.api.post('/auth/forgot-password', { email }),
    
    resetPassword: (token: string, password: string) =>
      this.api.post('/auth/reset-password', { token, password }),
    
    verifyEmail: (token: string) =>
      this.api.post('/auth/verify-email', { token }),
    
    resendVerification: () =>
      this.api.post('/auth/resend-verification'),
  };

  // Store APIs
  stores = {
    getAll: (params?: {
      search?: string;
      category?: string;
      isOpen?: boolean;
      page?: number;
      limit?: number;
    }) => this.api.get('/stores', { params }),
    
    getById: (storeId: string) => this.api.get(`/stores/${storeId}`),
    
    getBySlug: (slug: string) => this.api.get(`/stores/slug/${slug}`),
    
    getNearby: (lat: number, lng: number, radius?: number) =>
      this.api.get('/stores/nearby', { params: { lat, lng, radius } }),
    
    // Admin only
    create: (storeData: any) => this.api.post('/stores', storeData),
    update: (storeId: string, storeData: any) =>
      this.api.patch(`/stores/${storeId}`, storeData),
    delete: (storeId: string) => this.api.delete(`/stores/${storeId}`),
    toggleStatus: (storeId: string) =>
      this.api.patch(`/stores/${storeId}/toggle`),
  };

  // Category APIs
  categories = {
    getAll: (params?: {
      storeId?: string;
      includeInactive?: boolean;
    }) => this.api.get('/categories', { params }),
    
    getById: (categoryId: string) => this.api.get(`/categories/${categoryId}`),
    
    // Admin/Manager only
    create: (categoryData: any) => this.api.post('/categories', categoryData),
    update: (categoryId: string, categoryData: any) =>
      this.api.patch(`/categories/${categoryId}`, categoryData),
    delete: (categoryId: string) => this.api.delete(`/categories/${categoryId}`),
  };

  // Item APIs
  items = {
    getAll: (params?: {
      storeId?: string;
      categoryId?: string;
      search?: string;
      isAvailable?: boolean;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    }) => this.api.get('/items', { params }),
    
    getById: (itemId: string) => this.api.get(`/items/${itemId}`),
    
    getPopular: (params?: { storeId?: string; limit?: number }) =>
      this.api.get('/items/popular/list', { params }),
    
    // Admin/Manager only
    create: (itemData: any) => this.api.post('/items', itemData),
    update: (itemId: string, itemData: any) =>
      this.api.patch(`/items/${itemId}`, itemData),
    delete: (itemId: string) => this.api.delete(`/items/${itemId}`),
    toggleAvailability: (itemId: string, isAvailable: boolean) =>
      this.api.patch(`/items/${itemId}/availability`, { isAvailable }),
  };

  // Order APIs
  orders = {
    create: (orderData: any) => this.api.post('/orders', orderData),
    
    getById: (orderId: string) => this.api.get(`/orders/${orderId}`),
    
    getByOrderNo: (orderNo: string) => this.api.get(`/orders/track/${orderNo}`),
    
    getUserOrders: (params?: {
      status?: string;
      page?: number;
      limit?: number;
    }) => this.api.get('/orders/user/history', { params }),
    
    updateStatus: (orderId: string, status: string, notes?: string) =>
      this.api.patch(`/orders/${orderId}/status`, { status, notes }),
    
    cancelOrder: (orderId: string, reason: string) =>
      this.api.patch(`/orders/${orderId}/cancel`, { reason }),
    
    rateOrder: (orderId: string, rating: number, review?: string) =>
      this.api.post(`/orders/${orderId}/rate`, { rating, review }),
    
    // Admin APIs
    getAll: (params?: {
      status?: string;
      storeId?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    }) => this.api.get('/orders', { params }),
  };

  // User APIs
  users = {
    getProfile: (userId?: string) =>
      this.api.get(`/users/profile${userId ? `/${userId}` : ''}`),
    
    updateProfile: (userData: any, userId?: string) =>
      this.api.patch(`/users/profile${userId ? `/${userId}` : ''}`, userData),
    
    getOrders: (params?: {
      userId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => this.api.get(`/users/orders${params?.userId ? `/${params.userId}` : ''}`, {
      params: { ...params, userId: undefined }
    }),
    
    // Address management
    getAddresses: (userId?: string) =>
      this.api.get(`/users/addresses${userId ? `/${userId}` : ''}`),
    
    addAddress: (addressData: any) =>
      this.api.post('/users/addresses', addressData),
    
    updateAddress: (addressId: string, addressData: any) =>
      this.api.patch(`/users/addresses/${addressId}`, addressData),
    
    deleteAddress: (addressId: string) =>
      this.api.delete(`/users/addresses/${addressId}`),
    
    // Favorites
    getFavorites: (userId?: string) =>
      this.api.get(`/users/favorites${userId ? `/${userId}` : ''}`),
    
    toggleFavorite: (itemId: string) =>
      this.api.post(`/users/favorites/${itemId}`),
    
    // Admin only
    getAll: (params?: {
      role?: string;
      isVerified?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }) => this.api.get('/users', { params }),
  };

  // Cart APIs
  cart = {
    get: () => this.api.get('/cart'),
    
    add: (itemData: {
      itemId: string;
      quantity: number;
      selectedVariant?: any;
      selectedAddons?: any[];
      specialInstructions?: string;
    }) => this.api.post('/cart/add', itemData),
    
    update: (itemId: string, quantity: number) =>
      this.api.patch('/cart/update', { itemId, quantity }),
    
    remove: (itemId: string) =>
      this.api.delete(`/cart/remove/${itemId}`),
    
    clear: () => this.api.delete('/cart/clear'),
    
    applyCoupon: (couponCode: string) =>
      this.api.post('/cart/coupon', { code: couponCode }),
    
    removeCoupon: () => this.api.delete('/cart/coupon'),
  };

  // Coupon APIs
  coupons = {
    validate: (code: string, orderValue?: number, storeId?: string) =>
      this.api.post('/coupons/validate', { code, orderValue, storeId }),
    
    // Admin/Manager only
    getAll: (params?: {
      isActive?: boolean;
      type?: string;
      page?: number;
      limit?: number;
    }) => this.api.get('/coupons', { params }),
    
    getById: (couponId: string) => this.api.get(`/coupons/${couponId}`),
    
    create: (couponData: any) => this.api.post('/coupons', couponData),
    
    update: (couponId: string, couponData: any) =>
      this.api.patch(`/coupons/${couponId}`, couponData),
    
    delete: (couponId: string) => this.api.delete(`/coupons/${couponId}`),
    
    toggle: (couponId: string) =>
      this.api.patch(`/coupons/${couponId}/toggle`),
    
    getStats: (couponId: string) =>
      this.api.get(`/coupons/${couponId}/stats`),
  };

  // Kitchen APIs
  kitchen = {
    getOrders: (params?: {
      status?: string;
      priority?: string;
      limit?: number;
    }) => this.api.get('/kitchen/orders', { params }),
    
    updateOrderStatus: (orderId: string, status: string, data?: {
      estimatedReadyTime?: string;
      notes?: string;
    }) => this.api.patch(`/kitchen/orders/${orderId}/status`, {
      status,
      ...data
    }),
    
    getMetrics: (params?: {
      from?: string;
      to?: string;
      storeId?: string;
    }) => this.api.get('/kitchen/metrics', { params }),
    
    updateItemPrepTime: (itemId: string, preparationTime: number) =>
      this.api.patch(`/kitchen/items/${itemId}/prep-time`, { preparationTime }),
    
    updateItemStock: (itemId: string, isAvailable: boolean, reason?: string) =>
      this.api.patch(`/kitchen/items/${itemId}/stock`, { isAvailable, reason }),
    
    getStaffShifts: (params?: { staffId?: string; date?: string }) =>
      this.api.get('/kitchen/staff/shifts', { params }),
    
    clockInOut: (action: 'in' | 'out', notes?: string) =>
      this.api.post('/kitchen/staff/clock', { action, notes }),
    
    reportIssue: (issueData: {
      type: string;
      priority: string;
      description: string;
      equipment?: string;
    }) => this.api.post('/kitchen/issues', issueData),
  };

  // Rider APIs
  riders = {
    getAll: (params?: {
      status?: string;
      vehicleType?: string;
      isOnline?: boolean;
    }) => this.api.get('/riders', { params }),
    
    getAvailable: () => this.api.get('/riders/available'),
    
    assignOrder: (orderId: string, riderId: string, estimatedDeliveryTime: string) =>
      this.api.post('/riders/assign', { orderId, riderId, estimatedDeliveryTime }),
    
    updateStatus: (riderId: string, status: string) =>
      this.api.patch(`/riders/${riderId}/status`, { status }),
    
    updateLocation: (riderId: string, lat: number, lng: number, address?: string) =>
      this.api.patch(`/riders/${riderId}/location`, { lat, lng, address }),
    
    getAssignments: (riderId: string, params?: {
      status?: string;
      page?: number;
      limit?: number;
    }) => this.api.get(`/riders/${riderId}/assignments`, { params }),
    
    updateAssignmentStatus: (assignmentId: string, status: string) =>
      this.api.patch(`/riders/assignments/${assignmentId}/status`, { status }),
    
    getAnalytics: (params?: {
      from?: string;
      to?: string;
      riderId?: string;
    }) => this.api.get('/riders/analytics/performance', { params }),
  };

  // Admin APIs
  admin = {
    // Dashboard metrics
    getMetrics: (params?: {
      from?: string;
      to?: string;
      storeId?: string;
    }) => this.api.get('/admin/metrics', { params }),

    getRevenueAnalytics: (params?: {
      period?: 'day' | 'week' | 'month' | 'year';
      from?: string;
      to?: string;
      storeId?: string;
    }) => this.api.get('/admin/analytics/revenue', { params }),

    getTopItems: (params?: {
      period?: 'day' | 'week' | 'month' | 'year';
      storeId?: string;
      limit?: number;
    }) => this.api.get('/admin/analytics/top-items', { params }),

    getStorePerformance: (params?: {
      period?: 'day' | 'week' | 'month' | 'year';
      sortBy?: 'revenue' | 'orders' | 'rating';
      limit?: number;
    }) => this.api.get('/admin/analytics/store-performance', { params }),

    getSystemHealth: () => this.api.get('/admin/system/health'),

    getPendingApprovals: () => this.api.get('/admin/approvals/pending'),

    getAnalytics: (params?: {
      from?: string;
      to?: string;
      storeId?: string;
    }) => this.api.get('/admin/analytics', { params }),
    
    getOrders: (params?: {
      status?: string;
      storeId?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    }) => this.api.get('/admin/orders', { params }),
    
    // Item management
    createItem: (itemData: any) => this.api.post('/admin/items', itemData),
    updateItem: (itemId: string, itemData: any) =>
      this.api.patch(`/admin/items/${itemId}`, itemData),
    deleteItem: (itemId: string) => this.api.delete(`/admin/items/${itemId}`),
    toggleItemAvailability: (itemId: string, isAvailable: boolean) =>
      this.api.patch(`/admin/items/${itemId}/availability`, { isAvailable }),
    
    // Coupon management
    createCoupon: (couponData: any) => this.api.post('/admin/coupons', couponData),

    // Store management
    approveStore: (storeId: string, approvalData?: any) =>
      this.api.post(`/admin/stores/${storeId}/approve`, approvalData),

    rejectStore: (storeId: string, reason: string) =>
      this.api.post(`/admin/stores/${storeId}/reject`, { reason }),

    suspendStore: (storeId: string, reason: string) =>
      this.api.post(`/admin/stores/${storeId}/suspend`, { reason }),

    reactivateStore: (storeId: string) =>
      this.api.post(`/admin/stores/${storeId}/reactivate`),

    // Rider management
    approveRider: (riderId: string, approvalData?: any) =>
      this.api.post(`/admin/riders/${riderId}/approve`, approvalData),

    rejectRider: (riderId: string, reason: string) =>
      this.api.post(`/admin/riders/${riderId}/reject`, { reason }),

    suspendRider: (riderId: string, reason: string) =>
      this.api.post(`/admin/riders/${riderId}/suspend`, { reason }),

    // Financial management
    approveWithdrawal: (withdrawalId: string) =>
      this.api.post(`/admin/withdrawals/${withdrawalId}/approve`),

    rejectWithdrawal: (withdrawalId: string, reason: string) =>
      this.api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason }),

    getFinancialReports: (params?: {
      type?: 'revenue' | 'commissions' | 'withdrawals';
      from?: string;
      to?: string;
      storeId?: string;
    }) => this.api.get('/admin/reports/financial', { params }),

    // System management
    updateSystemSettings: (settings: any) =>
      this.api.patch('/admin/system/settings', settings),

    sendNotification: (notificationData: {
      type: 'all' | 'customers' | 'stores' | 'riders';
      title: string;
      message: string;
      userIds?: string[];
    }) => this.api.post('/admin/notifications/send', notificationData),

    exportData: (params: {
      type: 'users' | 'orders' | 'stores' | 'riders' | 'revenue';
      format: 'csv' | 'excel' | 'pdf';
      from?: string;
      to?: string;
      filters?: any;
    }) => this.api.post('/admin/export', params),
  };

  // Rider App APIs (for rider dashboard)
  riderApp = {
    getOrders: (params?: {
      status?: string;
      limit?: number;
      radius?: number;
    }) => this.api.get('/riders/orders', { params }),

    updateOrderStatus: (orderId: string, status: string, data?: any) =>
      this.api.patch(`/riders/orders/${orderId}/status`, { status, ...data }),

    acceptOrder: (orderId: string) =>
      this.api.post(`/riders/orders/${orderId}/accept`),

    declineOrder: (orderId: string, reason: string) =>
      this.api.post(`/riders/orders/${orderId}/decline`, { reason }),

    updateLocation: (location: any) =>
      this.api.patch('/riders/location', location),

    getMetrics: (params?: {
      from?: string;
      to?: string;
    }) => this.api.get('/riders/metrics', { params }),

    startShift: (location: any) =>
      this.api.post('/riders/shift/start', { location }),

    endShift: (location: any) =>
      this.api.post('/riders/shift/end', { location }),

    takeBreak: (duration: number) =>
      this.api.post('/riders/shift/break', { duration }),

    resumeWork: () =>
      this.api.post('/riders/shift/resume'),

    getCurrentShift: () =>
      this.api.get('/riders/shift/current'),

    reportIssue: (issueData: any) =>
      this.api.post('/riders/issues', issueData),
  };

  // Payment APIs (placeholder for third-party integrations)
  payments = {
    // Stripe integration
    createPaymentIntent: (amount: number, currency: string = 'usd') => {
      console.warn('Stripe API key required for payment processing');
      toast.warning('Stripe API key required for live payments');
      return Promise.resolve({
        data: {
          clientSecret: 'mock_client_secret',
          message: 'Stripe API key required for live payments'
        }
      });
    },
    
    confirmPayment: (paymentIntentId: string) => {
      console.warn('Stripe API key required for payment confirmation');
      toast.warning('Payment confirmation requires Stripe setup');
      return Promise.resolve({
        data: {
          status: 'succeeded',
          message: 'Mock payment confirmation - Stripe API key required for live payments'
        }
      });
    },
    
    // PayPal integration placeholder
    createPayPalOrder: (amount: number) => {
      console.warn('PayPal API credentials required');
      toast.warning('PayPal API credentials required for live payments');
      return Promise.resolve({
        data: {
          orderId: 'mock_paypal_order',
          message: 'PayPal API credentials required for live payments'
        }
      });
    },
  };

  // Maps/Location APIs (placeholder for third-party integrations)
  maps = {
    geocodeAddress: (address: string) => {
      console.warn('Google Maps API key required for geocoding');
      toast.warning('Google Maps API key required for location features');
      return Promise.resolve({
        data: {
          lat: 40.7128,
          lng: -74.0060,
          formatted_address: address,
          message: 'Google Maps API key required for live geocoding'
        }
      });
    },
    
    getDirections: (origin: string, destination: string) => {
      console.warn('Google Maps API key required for directions');
      toast.warning('Google Maps API key required for navigation features');
      return Promise.resolve({
        data: {
          distance: '2.5 km',
          duration: '15 mins',
          route: [],
          message: 'Google Maps API key required for live directions'
        }
      });
    },
    
    calculateDeliveryFee: (distance: number) => {
      // Mock calculation - in real app would use sophisticated algorithms
      const baseFee = 2.99;
      const perKmFee = 0.99;
      const fee = baseFee + (distance * perKmFee);
      
      return Promise.resolve({
        data: {
          fee: Math.round(fee * 100) / 100,
          distance,
          breakdown: {
            base: baseFee,
            distance: distance * perKmFee
          }
        }
      });
    },
  };

  // Notifications APIs
  notifications = {
    // Push notifications (would integrate with FCM or similar)
    subscribe: (token: string) => {
      console.warn('Firebase/FCM API key required for push notifications');
      toast.warning('Push notification service requires Firebase/FCM setup');
      return Promise.resolve({
        data: {
          success: true,
          message: 'Push notification subscription requires Firebase/FCM setup'
        }
      });
    },
    
    // SMS notifications (would integrate with Twilio or similar)
    sendSMS: (phone: string, message: string) => {
      console.warn('Twilio API credentials required for SMS');
      toast.warning('SMS service requires Twilio API credentials');
      return Promise.resolve({
        data: {
          success: true,
          message: 'SMS sending requires Twilio API credentials'
        }
      });
    },
    
    // Email notifications (would integrate with SendGrid or similar)
    sendEmail: (to: string, subject: string, content: string) => {
      console.warn('SendGrid/Email service API key required');
      toast.warning('Email service requires SendGrid or similar service setup');
      return Promise.resolve({
        data: {
          success: true,
          message: 'Email sending requires SendGrid or similar service setup'
        }
      });
    },
  };

  // File upload APIs
  uploads = {
    uploadImage: (file: File, folder: string = 'general') => {
      // Mock file upload - in real app would upload to AWS S3/Cloudinary
      toast.warning('File uploaded to local storage - AWS S3/Cloudinary setup required for production');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              url: URL.createObjectURL(file),
              publicId: `mock_${Date.now()}`,
              message: 'File uploaded to local storage - AWS S3/Cloudinary setup required for production'
            }
          });
        }, 1000);
      });
    },
    
    deleteImage: (publicId: string) => {
      console.warn('AWS S3/Cloudinary API credentials required for file deletion');
      toast.warning('File deletion requires cloud storage service setup');
      return Promise.resolve({
        data: {
          success: true,
          message: 'File deletion requires cloud storage service setup'
        }
      });
    },
  };
}

export const api = new ApiService();
export default api;

// Error handler with toast notifications
export const handleApiError = (error: unknown, fallbackMessage = 'Something went wrong') => {
  let message = fallbackMessage;
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  toast.error(message);
  console.error('API Error:', error);
};

// Success handler with toast notifications
export const handleApiSuccess = (message: string) => {
  toast.success(message);
};
