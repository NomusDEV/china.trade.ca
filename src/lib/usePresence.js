import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const ONLINE_THRESHOLD = 30000; // 30 seconds

export function getPresenceStatus(lastSeen) {
  if (!lastSeen) return { online: false, text: '' };
  const diff = Date.now() - new Date(lastSeen).getTime();
  if (diff < ONLINE_THRESHOLD) return { online: true, text: '' };
  const date = new Date(lastSeen);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return { online: false, text: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  }
  return { online: false, text: date.toLocaleDateString([], { day: 'numeric', month: 'short' }) };
}

let globalPresenceId = null;
let activeInterval = false;

export function usePresence() {
  const { user, isAuthenticated } = useAuth();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const updatePresence = useCallback(async (data) => {
    if (!user) return;
    try {
      if (globalPresenceId) {
        await base44.entities.Presence.update(globalPresenceId, data);
      } else {
        const records = await base44.entities.Presence.filter({ user_id: user.id });
        if (records.length > 0) {
          globalPresenceId = records[0].id;
          await base44.entities.Presence.update(records[0].id, data);
        } else {
          const created = await base44.entities.Presence.create({
            user_id: user.id,
            user_name: user.full_name || user.email,
            user_avatar: user.avatar || '',
            user_role: user.role || 'user',
            last_seen: new Date().toISOString(),
            is_typing: false,
            typing_thread_id: '',
            ...data,
          });
          globalPresenceId = created.id;
        }
      }
    } catch (e) {}
  }, [user]);

  // Global presence update — only one interval across all hook instances
  useEffect(() => {
    if (!isAuthenticated || !user || activeInterval) return;
    activeInterval = true;

    const tick = () => updatePresence({ last_seen: new Date().toISOString() });
    tick();
    const interval = setInterval(tick, 15000);

    const handleBeforeUnload = () => {
      updatePresence({ is_typing: false, last_seen: new Date().toISOString() });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      activeInterval = false;
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      updatePresence({ is_typing: false });
    };
  }, [isAuthenticated, user, updatePresence]);

  const setTyping = useCallback((threadId, isTyping) => {
    if (isTyping) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        updatePresence({ is_typing: true, typing_thread_id: threadId });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        updatePresence({ is_typing: false, typing_thread_id: '' });
      }, 3000);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        updatePresence({ is_typing: false, typing_thread_id: '' });
      }
    }
  }, [updatePresence]);

  return { setTyping };
}

export function usePresenceList() {
  const [presences, setPresences] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const records = await base44.entities.Presence.list();
        setPresences(records);
      } catch (e) {}
    };
    load();
    const interval = setInterval(load, 5000);

    let unsubscribe = () => {};
    try {
      unsubscribe = base44.entities.Presence.subscribe(() => {
        load();
      });
    } catch (e) {}

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return presences;
}