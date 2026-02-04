import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [activeDeposit, setActiveDeposit] = useState(null);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [topStrip, setTopStrip] = useState([]);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const wsReconnectTimerRef = useRef(null);
  const wsPingTimerRef = useRef(null);

  // Get Telegram WebApp data
  const getTelegramUser = useCallback(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    // Fallback for development
    return {
      id: 414135760,
      first_name: 'Dev User',
      username: 'devuser',
      photo_url: null,
    };
  }, []);

  // Extract referrer from start param
  const getReferrerTgId = useCallback(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
      const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
      const referrerId = parseInt(startParam, 10);
      if (!isNaN(referrerId)) {
        return referrerId;
      }
    }
    return null;
  }, []);

  // Initialize user
  const initUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tgUser = getTelegramUser();
      const referrerTgId = getReferrerTgId();

      const userData = await api.auth({
        tg_id: tgUser.id,
        username: tgUser.username,
        first_name: tgUser.first_name,
        avatar_url: tgUser.photo_url,
        referrer_tg_id: referrerTgId,
      });

      setUser(userData);

      // Load stats, tariffs, and deposits
      const [statsData, tariffsData, depositsData] = await Promise.all([
        api.getUserStats(tgUser.id),
        api.getTariffs(),
        api.getUserDeposits(tgUser.id),
      ]);

      setStats(statsData);
      setTariffs(tariffsData);
      setDeposits(depositsData);
      // Find active deposit
      const active = depositsData.find(d => d.status === 'active' || d.status === 'acive');
      setActiveDeposit(active || null);
    } catch (err) {
      console.error('Init error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getTelegramUser, getReferrerTgId]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    try {
      const [userData, statsData, depositsData] = await Promise.all([
        api.getUser(user.tg_id),
        api.getUserStats(user.tg_id),
        api.getUserDeposits(user.tg_id),
      ]);
      setUser(userData);
      setStats(statsData);
      setDeposits(depositsData);
      // Find active deposit
      const active = depositsData.find(d => d.status === 'active' || d.status === 'acive');
      setActiveDeposit(active || null);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }, [user]);

  // Activate promo code
  const activatePromo = useCallback(async (code) => {
    if (!user) return null;

    const normalized = (code || '').trim();
    if (!normalized) throw new Error('Введите промокод');

    const result = await api.activatePromo(user.tg_id, normalized);
    await refreshUser();
    return result;
  }, [user, refreshUser]);

  // Toggle auto reinvest
  const toggleAutoReinvest = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await api.toggleAutoReinvest(user.tg_id);
      setUser(prev => ({ ...prev, auto_reinvest: result.auto_reinvest }));
      return result.auto_reinvest;
    } catch (err) {
      console.error('Toggle error:', err);
      throw err;
    }
  }, [user]);

  // Collect accumulated
  const collectAccumulated = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await api.collectAccumulated(user.tg_id);
      await refreshUser();
      return result;
    } catch (err) {
      console.error('Collect error:', err);
      throw err;
    }
  }, [user, refreshUser]);

  // Create deposit
  const createDeposit = useCallback(async (amount, autoReinvest = false) => {
    if (!user) return;
    
    try {
      const result = await api.createDeposit(user.tg_id, amount, autoReinvest);
      await refreshUser();
      return result;
    } catch (err) {
      console.error('Deposit error:', err);
      throw err;
    }
  }, [user, refreshUser]);

  // Reinvest
  const reinvest = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await api.reinvest(user.tg_id);
      await refreshUser();
      return result;
    } catch (err) {
      console.error('Reinvest error:', err);
      throw err;
    }
  }, [user, refreshUser]);

  // Process payouts (trigger when time runs out)
  const processPayouts = useCallback(async () => {
    try {
      await api.processPayouts();
      await refreshUser();
    } catch (err) {
      console.error('Process payouts error:', err);
    }
  }, [refreshUser]);

  // Withdraw deposit
  const withdrawDeposit = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await api.withdrawDeposit(user.tg_id);
      await refreshUser();
      return result;
    } catch (err) {
      console.error('Withdraw deposit error:', err);
      throw err;
    }
  }, [user, refreshUser]);

  // Create withdraw request
  const createWithdraw = useCallback(async (amount) => {
    if (!user) return;
    
    try {
      const result = await api.createWithdraw(user.tg_id, amount);
      await refreshUser();
      return result;
    } catch (err) {
      console.error('Withdraw error:', err);
      throw err;
    }
  }, [user, refreshUser]);

  // Get live transactions
  const getLiveTransactions = useCallback(async (limit = 20) => {
    try {
      return await api.getLiveTransactions(limit);
    } catch (err) {
      console.error('Live transactions error:', err);
      return [];
    }
  }, []);

  // Get user transactions
  const getUserTransactions = useCallback(async (type = null) => {
    if (!user) return [];
    
    try {
      return await api.getUserTransactions(user.tg_id, type);
    } catch (err) {
      console.error('User transactions error:', err);
      return [];
    }
  }, [user]);

  // Get referral stats
  const getReferralStats = useCallback(async () => {
    if (!user) return null;
    
    try {
      return await api.getReferralStats(user.tg_id);
    } catch (err) {
      console.error('Referral stats error:', err);
      return null;
    }
  }, [user]);

  // Initialize on mount
  useEffect(() => {
    initUser();
  }, [initUser]);

  // Global WS: live transactions + top strip (same for everyone)
  useEffect(() => {
    const buildWsUrl = () => {
      const base = api.baseUrl || (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');
      const wsBase = base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
      return `${wsBase}/ws/live`;
    };

    const connect = () => {
      try {
        const url = buildWsUrl();
        setWsStatus('connecting');
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsStatus('connected');
          if (wsPingTimerRef.current) clearInterval(wsPingTimerRef.current);
          wsPingTimerRef.current = setInterval(() => {
            try {
              if (ws.readyState === WebSocket.OPEN) ws.send('ping');
            } catch (e) {
              // ignore
            }
          }, 20000);
        };

        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if (msg?.type === 'live_snapshot') {
              // backward compatibility
              if (Array.isArray(msg.live_transactions)) setLiveTransactions(msg.live_transactions);
              if (Array.isArray(msg.top_strip)) setTopStrip(msg.top_strip);
              return
            }

            if (msg?.type === 'live_init') {
              if (Array.isArray(msg.live_transactions)) setLiveTransactions(msg.live_transactions);
              if (Array.isArray(msg.top_strip)) setTopStrip(msg.top_strip);
              return
            }

            if (msg?.type === 'live_tx_item' && msg.item) {
              setLiveTransactions((prev) => {
                const next = [msg.item, ...(prev || [])]
                const dedup = []
                const seen = new Set()
                for (const t of next) {
                  if (!t?.id) continue
                  if (seen.has(t.id)) continue
                  seen.add(t.id)
                  dedup.push(t)
                  if (dedup.length >= 10) break
                }
                return dedup
              })
              return
            }

            if (msg?.type === 'top_strip_item' && msg.item) {
              setTopStrip((prev) => {
                const next = [msg.item, ...(prev || [])]
                return next.slice(0, 12)
              })
            }
          } catch (e) {
            // ignore
          }
        };

        ws.onerror = () => {
          // will reconnect on close
        };

        ws.onclose = () => {
          setWsStatus('disconnected');
          if (wsPingTimerRef.current) {
            clearInterval(wsPingTimerRef.current);
            wsPingTimerRef.current = null;
          }

          if (wsReconnectTimerRef.current) clearTimeout(wsReconnectTimerRef.current);
          wsReconnectTimerRef.current = setTimeout(() => connect(), 1500);
        };
      } catch (e) {
        setWsStatus('disconnected');
        if (wsReconnectTimerRef.current) clearTimeout(wsReconnectTimerRef.current);
        wsReconnectTimerRef.current = setTimeout(() => connect(), 2000);
      }
    };

    connect();

    return () => {
      if (wsReconnectTimerRef.current) {
        clearTimeout(wsReconnectTimerRef.current);
        wsReconnectTimerRef.current = null;
      }
      if (wsPingTimerRef.current) {
        clearInterval(wsPingTimerRef.current);
        wsPingTimerRef.current = null;
      }
      try {
        wsRef.current?.close();
      } catch (e) {
        // ignore
      }
      wsRef.current = null;
    };
  }, []);

  // Expand Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
    }
  }, []);

  const value = {
    user,
    stats,
    tariffs,
    deposits,
    activeDeposit,
    liveTransactions,
    topStrip,
    wsStatus,
    loading,
    error,
    refreshUser,
    toggleAutoReinvest,
    collectAccumulated,
    createDeposit,
    reinvest,
    withdrawDeposit,
    createWithdraw,
    processPayouts,
    getLiveTransactions,
    getUserTransactions,
    getReferralStats,
    activatePromo,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export default AppContext;
