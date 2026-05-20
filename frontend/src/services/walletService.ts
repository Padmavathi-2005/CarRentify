import { API_BASE_URL } from "@/config/api";

export const walletService = {
  async getBalance() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.warn("Wallet balance fetch failed:", response.status);
        return { balance: 0, currency: "USD" };
      }
      return response.json();
    } catch (err) {
      console.warn("Wallet balance network error:", err);
      return { balance: 0, currency: "USD" };
    }
  },

  async getTransactions() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.warn("Wallet transactions fetch failed:", response.status);
        return [];
      }
      return response.json();
    } catch (err) {
      console.warn("Wallet transactions network error:", err);
      return [];
    }
  },

  async addFunds(amount: number, description?: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/add-funds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, description }),
    });
    if (!response.ok) throw new Error("Failed to add funds");
    return response.json();
  },

  async createCheckoutSession(amount: number, method: string = 'stripe') {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, method }),
    });
    if (!response.ok) throw new Error(`Failed to create ${method} session`);
    return response.json();
  },

  async createStripeSession(amount: number) {
    return this.createCheckoutSession(amount, 'stripe');
  },

  async adminUpdateBalance(userId: string, amount: number, description: string, type: 'credit' | 'debit') {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/admin/update-balance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, amount, description, type }),
    });
    if (!response.ok) throw new Error("Failed to update wallet balance");
    return response.json();
  },

  async getWithdrawalRequests() {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/admin/withdrawals`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch withdrawal requests");
    return response.json();
  },

  async approveWithdrawal(withdrawalId: string) {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/admin/withdrawals/${withdrawalId}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to approve withdrawal");
    return response.json();
  },

  async rejectWithdrawal(withdrawalId: string, reason: string) {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/admin/withdrawals/${withdrawalId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error("Failed to reject withdrawal");
    return response.json();
  },

  async getPayoutMethod() {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/payout-method`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 404) return null;
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Payout method fetch error:", errorData);
        throw new Error("Failed to fetch payout method");
      }
      return response.json();
    } catch (error) {
      console.error("Error in getPayoutMethod:", error);
      return null; // Return null as a fallback to prevent UI crash
    }
  },

  async savePayoutMethod(data: any) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/payout-method`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to save payout method");
    return response.json();
  },

  async requestWithdrawal(amount: number) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error("Failed to request withdrawal");
    return response.json();
  },
  
  async getStats() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/wallet/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return { balance: 0, totalEarnings: 0, pendingPayouts: 0 };
    return response.json();
  }
};
