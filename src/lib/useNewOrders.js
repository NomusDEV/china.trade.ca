import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export function useNewOrders() {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'admin') {
      setCount(0);
      return;
    }
    try {
      const pending = await base44.entities.Order.filter({ status: 'pending' });
      setCount(pending.length);
    } catch (e) {}
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 15000);

    let unsubscribe = () => {};
    try {
      unsubscribe = base44.entities.Order.subscribe(() => {
        fetchCount();
      });
    } catch (e) {}

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchCount]);

  return count;
}