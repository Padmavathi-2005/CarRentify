const API_BASE_URL = 'http://localhost:3001/auth';

export const authService = {
  async login(email: string, password: string) {
    // Admin Mock Bypass
    if (email === 'admin@gmail.com' && password === 'admin') {
      return { message: 'OTP sent' };
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async verifyOtp(email: string, code: string) {
    // Admin Mock Bypass
    if (email === 'admin@gmail.com' && code === '123456') {
      const mockUser = { 
        id: 'mock-admin-id',
        email: 'admin@gmail.com',
        displayName: 'Administrator',
        firstName: 'Admin',
        lastName: 'User',
        profileImage: null
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { access_token: 'mock-admin-token', user: mockUser };
    }

    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Invalid OTP');
    
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
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

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
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
  }
};
