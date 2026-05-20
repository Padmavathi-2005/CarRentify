import { API_BASE_URL as BASE } from '@/config/api';

const API_BASE_URL = `${BASE}/auth`;

export const authService = {
  // --- USER SESSION ---
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    if (data.user) this.setUser(data.user);
    if (data.access_token) this.setToken(data.access_token);
    return data;
  },

  async recoverAccount(email: string) {
    const response = await fetch(`${BASE}/users/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Recovery failed');
    return data;
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // --- ADMIN SESSION ---
  async adminLogin(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Administrative Login Failed');
    if (data.user) this.setAdminUser(data.user);
    if (data.access_token) this.setAdminToken(data.access_token);
    return data;
  },

  setAdminToken(token: string) {
    localStorage.setItem('admin_token', token);
  },

  getAdminToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  },

  setAdminUser(user: any) {
    localStorage.setItem('admin_user', JSON.stringify(user));
  },

  getAdminUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  adminLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/admin-login';
  },

  // --- GENERAL ---
  async verifyOtp(email: string, code: string) {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Invalid OTP');
    
    if (data.user) {
      this.setUser(data.user);
    }
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    
    return data;
  },

  async register(payload: { email: string, password?: string, firstName?: string, lastName?: string, displayName?: string, phone?: string }) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async resendOtp(email: string) {
    const response = await fetch(`${API_BASE_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to resend code');
    return data;
  },

  async getProfile(isAdmin: boolean = false) {
    const token = isAdmin ? this.getAdminToken() : this.getToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
         isAdmin ? this.adminLogoutSilently() : this.logoutSilently();
         return null;
      }
      throw new Error('Failed to fetch profile');
    }

    const user = await response.json();
    isAdmin ? this.setAdminUser(user) : this.setUser(user);
    return user;
  },

  logoutSilently() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  adminLogoutSilently() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  async changePassword(payload: any, isAdmin: boolean = false) {
    const token = isAdmin ? this.getAdminToken() : this.getToken();
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Operation failed');
    return data;
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  async resetPassword(payload: any) {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Reset failed');
    return data;
  }
};
