const BASE_URL = 'http://localhost:8080/api';

class ApiService {
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async request(endpoint, options = {}) {
    const accessToken = this.getAccessToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const config = {
      ...options,
      headers,
    };
    
    let response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Auto Refresh token logic if unauthorized
    if (response.status === 401 && this.getRefreshToken()) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.getRefreshToken() }),
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          this.setTokens(data.accessToken, data.refreshToken);
          
          headers['Authorization'] = `Bearer ${data.accessToken}`;
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          this.clearTokens();
        }
      } catch {
        this.clearTokens();
      }
    }

    if (response.status === 403 && endpoint.startsWith('/admin')) {
      console.warn('Access Forbidden for administrative endpoint. Clearing session state.');
      this.clearTokens();
    }

    return response;
  }

  // AUTH API
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.token, data.refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      }));
    }
    return { ok: response.ok, status: response.status, data };
  }

  async register(username, email, password, role) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role }),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  async verifyOtp(email, otpCode, purpose) {
    const response = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode, purpose }),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  async resendOtp(email, purpose) {
    const response = await this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  async forgotPassword(email) {
    const response = await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  async resetPassword(email, otpCode, newPassword) {
    const response = await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode, newPassword }),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  async changePassword(oldPassword, newPassword) {
    const response = await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore error
    }
    this.clearTokens();
  }

  async getCurrentUser() {
    const response = await this.request('/auth/me', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  // ADMIN API
  async getAdminCustomers(page = 0, size = 20) {
    const response = await this.request(`/admin/customers?page=${page}&size=${size}`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  async getAdminSellers(page = 0, size = 20) {
    const response = await this.request(`/admin/sellers?page=${page}&size=${size}`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  }

  // CATALOG & SEARCH API
  async getCategories() {
    const response = await this.request('/categories', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getSubCategories(categoryId = null) {
    const endpoint = categoryId ? `/subcategories?category_id=${categoryId}` : '/subcategories';
    const response = await this.request(endpoint, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category_id !== null && params.category_id !== undefined && params.category_id !== '') {
      query.append('category_id', params.category_id);
    }
    if (params.subcategory_id !== null && params.subcategory_id !== undefined && params.subcategory_id !== '') {
      query.append('subcategory_id', params.subcategory_id);
    }
    if (params.search !== null && params.search !== undefined && params.search !== '') {
      query.append('search', params.search);
    }
    if (params.min_price !== null && params.min_price !== undefined && params.min_price !== '') {
      query.append('min_price', params.min_price);
    }
    if (params.max_price !== null && params.max_price !== undefined && params.max_price !== '') {
      query.append('max_price', params.max_price);
    }
    if (params.in_stock === true || params.in_stock === false) {
      query.append('in_stock', params.in_stock);
    }
    if (params.sort_by !== null && params.sort_by !== undefined && params.sort_by !== '') {
      query.append('sort_by', params.sort_by);
    }

    const endpoint = `/products${query.toString() ? '?' + query.toString() : ''}`;
    const response = await this.request(endpoint, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getProductById(id) {
    const response = await this.request(`/products/${id}`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getSimilarProducts(id) {
    const response = await this.request(`/products/${id}/similar`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getTrendingProducts() {
    const response = await this.request('/products/trending', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getNewArrivals() {
    const response = await this.request('/products/new-arrivals', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getBestSellers() {
    const response = await this.request('/products/best-sellers', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  // WISHLIST API
  async getWishlist() {
    const response = await this.request('/wishlist', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async addToWishlist(productId) {
    const response = await this.request('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async removeFromWishlist(productId) {
    const response = await this.request(`/wishlist/${productId}`, { method: 'DELETE' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  // CART API
  async addToCart(productId, quantity = 1) {
    const response = await this.request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getCartCount() {
    const response = await this.request('/cart/count', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getCartItems() {
    const response = await this.request('/cart', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async updateCartItem(cartItemId, quantity) {
    const response = await this.request(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async removeCartItem(cartItemId) {
    const response = await this.request(`/cart/${cartItemId}`, { method: 'DELETE' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async checkoutCart() {
    const response = await this.request('/cart/checkout', { method: 'POST' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  // ADDRESS API
  async getAddresses() {
    const response = await this.request('/addresses', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async addAddress(addressData) {
    const response = await this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async deleteAddress(addressId) {
    const response = await this.request(`/addresses/${addressId}`, { method: 'DELETE' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  // PAYMENT & ORDERS API
  async getMyOrders() {
    const response = await this.request('/orders/my-orders', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async updateOrderAddress(orderId, addressSnapshot) {
    const response = await this.request(`/orders/${orderId}/address`, {
      method: 'PUT',
      body: JSON.stringify({ addressSnapshot }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async updateOrderStatus(orderId, status) {
    const response = await this.request(`/orders/admin/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getAllOrders() {
    const response = await this.request('/admin/orders', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getAdminProducts() {
    const response = await this.request('/admin/products', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async createProduct(productData) {
    const response = await this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async updateProduct(id, productData) {
    const response = await this.request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async deleteProduct(id) {
    const response = await this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async updateUser(id, userData) {
    const response = await this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async updateUserStatus(id, isActive) {
    const response = await this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getCustomerDetails(id) {
    const response = await this.request(`/admin/customers/${id}`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getRevenueReport(period = 'daily', date = '') {
    const response = await this.request(`/admin/revenue?period=${period}&date=${encodeURIComponent(date)}`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async createPaymentOrder(amount) {
    const response = await this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async verifyPayment(paymentDetails) {
    const response = await this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentDetails),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async createCodOrder(addressSnapshot) {
    const response = await this.request('/orders/create-cod', {
      method: 'POST',
      body: JSON.stringify({ address_snapshot: addressSnapshot }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  // REVIEWS API
  async submitBatchReviews(reviewsList) {
    const response = await this.request('/reviews/batch', {
      method: 'POST',
      body: JSON.stringify(reviewsList),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async updateReview(reviewId, rating, comment) {
    const response = await this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async deleteReview(reviewId) {
    const response = await this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getProductReviews(productId) {
    const response = await this.request(`/products/${productId}/reviews`, {
      method: 'GET',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getMyReviews() {
    const response = await this.request('/reviews/my', {
      method: 'GET',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getOrderReviews(orderId) {
    const response = await this.request(`/orders/${orderId}/reviews`, {
      method: 'GET',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async voteHelpfulReview(reviewId) {
    const response = await this.request(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async reportReview(reviewId) {
    const response = await this.request(`/reviews/${reviewId}/report`, {
      method: 'POST',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async replyToReview(reviewId, sellerReply) {
    const response = await this.request(`/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ sellerReply }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getPendingReviews() {
    const response = await this.request('/admin/reviews/pending', {
      method: 'GET',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async approveReview(reviewId) {
    const response = await this.request(`/admin/reviews/${reviewId}/approve`, {
      method: 'PUT',
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  // OMS EXTENSION API
  async getOrderDetails(orderId) {
    const response = await this.request(`/orders/${orderId}`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async cancelOrder(orderId, reason) {
    const response = await this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getDashboardSummary() {
    const response = await this.request('/orders/dashboard-summary', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getShipmentTracking(orderId) {
    const response = await this.request(`/shipments/${orderId}`, { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async adminUpdateShipment(orderId, courierName, trackingNumber, currentLocation, status) {
    const response = await this.request(`/shipments/admin/${orderId}/update`, {
      method: 'POST',
      body: JSON.stringify({ courierName, trackingNumber, currentLocation, status }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async downloadInvoicePdf(orderId) {
    const accessToken = this.getAccessToken();
    const response = await fetch(`${BASE_URL}/invoices/${orderId}/download`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Invoice download failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async submitReturnRequest(orderId, productId, type, reason, comments, imageUrl) {
    const response = await this.request('/returns', {
      method: 'POST',
      body: JSON.stringify({ orderId, productId, type, reason, comments, imageUrl }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getMyReturns() {
    const response = await this.request('/returns/my-returns', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getAdminReturns() {
    const response = await this.request('/returns/admin/all', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async updateReturnStatus(returnId, status) {
    const response = await this.request(`/returns/admin/${returnId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  async getMyPayments() {
    const response = await this.request('/payments-history/my-payments', { method: 'GET' });
    const data = await response.json();
    return { ok: response.ok, data };
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export const api = new ApiService();
