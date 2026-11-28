import { base44 } from '@/api/base44Client';

export function notifyComment({ recipientId, actor, type, commentId, itemType, itemId, text }) {
  if (!recipientId || !actor?.id || recipientId === actor.id) return Promise.resolve();
  return base44.entities.Notification.create({
    recipient_id: recipientId,
    actor_id: actor.id,
    actor_name: actor.full_name || actor.email?.split('@')[0] || '',
    actor_avatar: actor.avatar || '',
    type,
    comment_id: commentId,
    item_type: itemType,
    item_id: itemId,
    text: (text || '').slice(0, 160),
    read: false,
  }).catch(() => {});
}