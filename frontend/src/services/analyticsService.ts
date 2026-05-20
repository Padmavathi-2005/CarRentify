import { API_BASE_URL } from "@/config/api";

const adminHeaders = () => {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const analyticsService = {
  async getSummaryKPIs() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/summary`, { headers: adminHeaders() });
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  },

  async getRevenueByMonth(months = 6) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/revenue?months=${months}`, { headers: adminHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },

  async getBookingStatusBreakdown() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/booking-status`, { headers: adminHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },

  async getTopCars(limit = 5) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/top-cars?limit=${limit}`, { headers: adminHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },

  async getPaymentMethodBreakdown() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/payment-methods`, { headers: adminHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },

  async getUserGrowthByMonth(months = 6) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics/user-growth?months=${months}`, { headers: adminHeaders() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  },
};
