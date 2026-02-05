export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const endpoints = {
  // Manual payout trigger (for testing)
  processPayouts: '/deposits/process-payouts',
  // Users
  auth: '/users/auth',
  user: (tgId) => `/users/${tgId}`,
  userStats: (tgId) => `/users/${tgId}/stats`,
  collect: (tgId) => `/users/${tgId}/collect`,
  toggleAutoReinvest: (tgId) => `/users/${tgId}/toggle-auto-reinvest`,
  
  // Tariffs
  tariffs: '/tariffs/',
  tariff: (id) => `/tariffs/${id}`,
  
  // Deposits
  createDeposit: (tgId) => `/deposits/${tgId}`,
  userDeposits: (tgId) => `/deposits/${tgId}`,
  reinvest: (tgId) => `/deposits/${tgId}/reinvest`,
  withdrawDeposit: (tgId) => `/deposits/${tgId}/withdraw-deposit`,
  
  // Transactions
  liveTransactions: '/transactions/live',
  userTransactions: (tgId) => `/transactions/${tgId}`,
  withdraw: (tgId) => `/transactions/${tgId}/withdraw`,
  gameBet: (tgId) => `/transactions/${tgId}/game/bet`,
  gamePayout: (tgId) => `/transactions/${tgId}/game/payout`,
  
  // Referrals
  referrals: (tgId) => `/referrals/${tgId}`,
  referralStats: (tgId) => `/referrals/${tgId}/stats`,
  referralLink: (tgId) => `/referrals/${tgId}/link`,
  
  // Payment Requisites
  paymentRequisites: '/payment-requisites/',

  // Market Rates
  marketRates: '/market-rates',

  // Promo
  promoActivate: (tgId) => `/promo/${tgId}/activate`,
};
