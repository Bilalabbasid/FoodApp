import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

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

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for auth
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { name: string; email: string; password: string; phone?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // Store methods
  async getStores() {
    return this.request('/stores');
  }

  async getStore(slug: string) {
    return this.request(`/stores/${slug}`);
  }

  async getStoreMenu(storeId: string, params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/stores/${storeId}/menu${queryString}`);
  }

  async getItem(storeId: string, slug: string) {
    return this.request(`/stores/${storeId}/items/${slug}`);
  }

  // Cart methods
  async calculateCartPricing(cartData: {
    items: any[];
    storeId: string;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryZoneId?: string;
    couponCode?: string;
    zipCode?: string;
  }) {
    return this.request('/cart/price', {
      method: 'POST',
      body: JSON.stringify(cartData),
    });
  }

  // Order methods
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderNo: string) {
    return this.request(`/orders/${orderNo}`);
  }

  async getUserOrders(page = 1, limit = 10) {
    try {
      return this.request(`/orders/user/history?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Get user orders error:', error);
      return { success: false, data: [], error };
    }
  }

  // Admin methods
  async getAnalytics(params?: Record<string, string>) {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request(`/admin/analytics${queryString}`);
    } catch (error) {
      console.error('Get analytics error:', error);
      return { success: false, data: null, error };
    }
  }

  async getAdminOrders(params?: Record<string, string>) {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      return this.request(`/admin/orders${queryString}`);
    } catch (error) {
      console.error('Get admin orders error:', error);
      return { success: false, data: [], pagination: null, error };
    }
  }

  async updateOrderStatus(orderId: string, status: string, note?: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  async createItem(itemData: any) {
    return this.request('/admin/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(itemId: string, itemData: any) {
    return this.request(`/admin/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(itemId: string) {
    return this.request(`/admin/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async updateItemAvailability(itemId: string, isAvailable: boolean) {
    return this.request(`/admin/items/${itemId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  }

  // Generic HTTP methods
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async createCoupon(couponData: any) {
    return this.request('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

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