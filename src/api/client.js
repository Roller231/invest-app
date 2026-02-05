import { API_BASE_URL, endpoints } from './config';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Users
  async auth(userData) {
    return this.request(endpoints.auth, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(tgId) {
    return this.request(endpoints.user(tgId));
  }

  async updateUser(tgId, data) {
    return this.request(endpoints.user(tgId), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(tgId) {
    return this.request(endpoints.userStats(tgId));
  }

  async collectAccumulated(tgId) {
    return this.request(endpoints.collect(tgId), {
      method: 'POST',
    });
  }

  async toggleAutoReinvest(tgId) {
    return this.request(endpoints.toggleAutoReinvest(tgId), {
      method: 'POST',
    });
  }

  // Tariffs
  async getTariffs() {
    return this.request(endpoints.tariffs);
  }

  async getTariff(id) {
    return this.request(endpoints.tariff(id));
  }

  // Deposits
  async createDeposit(tgId, amount, autoReinvest = false) {
    return this.request(endpoints.createDeposit(tgId), {
      method: 'POST',
      body: JSON.stringify({ amount, auto_reinvest: autoReinvest }),
    });
  }

  async getUserDeposits(tgId) {
    return this.request(endpoints.userDeposits(tgId));
  }

  async reinvest(tgId) {
    return this.request(endpoints.reinvest(tgId), {
      method: 'POST',
    });
  }

  async withdrawDeposit(tgId) {
    return this.request(endpoints.withdrawDeposit(tgId), {
      method: 'POST',
    });
  }

  // Transactions
  async getLiveTransactions(limit = 20) {
    return this.request(`${endpoints.liveTransactions}?limit=${limit}`);
  }

  async getUserTransactions(tgId, type = null, limit = 50) {
    let url = `${endpoints.userTransactions(tgId)}?limit=${limit}`;
    if (type) url += `&tx_type=${type}`;
    return this.request(url);
  }

  async createWithdraw(tgId, amount) {
    return this.request(`${endpoints.withdraw(tgId)}?amount=${amount}`, {
      method: 'POST',
    });
  }

  async createGameBet(tgId, amount) {
    return this.request(`${endpoints.gameBet(tgId)}?amount=${amount}`, {
      method: 'POST',
    });
  }

  async createGamePayout(tgId, amount) {
    return this.request(`${endpoints.gamePayout(tgId)}?amount=${amount}`, {
      method: 'POST',
    });
  }

  // Process payouts (for testing)
  async processPayouts() {
    return this.request(endpoints.processPayouts, {
      method: 'POST',
    });
  }

  // Referrals
  async getReferrals(tgId) {
    return this.request(endpoints.referrals(tgId));
  }

  async getReferralStats(tgId) {
    return this.request(endpoints.referralStats(tgId));
  }

  async getReferralLink(tgId) {
    return this.request(endpoints.referralLink(tgId));
  }

  // Payment Requisites
  async getPaymentRequisites() {
    return this.request(endpoints.paymentRequisites);
  }

  // Market Rates
  async getMarketRates() {
    return this.request(endpoints.marketRates);
  }

  // Promo
  async activatePromo(tgId, code) {
    return this.request(endpoints.promoActivate(tgId), {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }
}

export const api = new ApiClient();
export default api;
