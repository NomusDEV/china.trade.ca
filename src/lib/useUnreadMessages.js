import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export function useUnreadMessages() {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }
    try {
      if (user.role === 'admin') {
        const msgs = await base44.entities.Message.filter({ sender_role: 'user', read: false });
        setUnreadCount(msgs.length);
      } else {
        const msgs = await base44.entities.Message.filter({ thread_user_id: user.id, sender_role: 'admin', read: false });
        setUnreadCount(msgs.length);
      }
    } catch (e) {}
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);

    let unsubscribe = () => {};
    try {
      unsubscribe = base44.entities.Message.subscribe(() => {
        fetchUnread();
      });
    } catch (e) {}

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchUnread]);

  return unreadCount;
}