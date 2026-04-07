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
    return data;
  },

  async verifyOtp(email: string, code: string) {
    // Admin Mock Bypass
    if (email === 'admin@gmail.com' && code === '123456') {
      return { access_token: 'mock-admin-token', user: { displayName: 'Admin' } };
    }

    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Invalid OTP');
    return data;
  },

  async register(email: string, password: string, firstName: string, lastName: string, displayName: string) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName, displayName }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
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

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
