import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Star, Send, Loader2, MessageSquare, Pencil, Trash2, Check, X, Heart, Reply } from 'lucide-react';
import { notifyComment } from '@/lib/notify';

function Stars({ value = 0, onChange, size = 'sm' }) {
  const [hover, setHover] = useState(0);
  const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            className={`${starSize} transition-colors ${
              (hover || value) >= star
                ? 'fill-[#C5A059] text-[#C5A059]'
                : 'fill-transparent text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function Avatar({ src, name, size = 'w-10 h-10' }) {
  return (
    <div className={`${size} rounded-full bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden`}>
      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : (name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function LikeButton({ liked, count, onClick, lang }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={lang === 'ru' ? 'Нравится' : 'Писанд аст'}
      className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
        liked ? 'text-[#E61D25]' : 'text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25]'
      }`}
    >
      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-[#E61D25]' : ''}`} />
      {count || 0}
    </button>
  );
}

function ReplyItem({ reply, likes, onToggleLike, lang }) {
  const date = new Date(reply.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex gap-2.5">
      <Avatar src={reply.user_avatar} name={reply.user_name} size="w-8 h-8" />
      <div className="flex-1 min-w-0">
        <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{reply.user_name || 'Аноним'}</span>
            <span className="text-[10px] text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30">{date}</span>
          </div>
          <p className="text-xs text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 whitespace-pre-wrap break-words">{reply.text}</p>
        </div>
        <div className="mt-1 ml-1">
          <LikeButton liked={likes?.likedByMe} count={likes?.count} onClick={() => onToggleLike(reply.id)} lang={lang} />
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, replies, likes, onToggleLike, repliesLikes, onReply, currentUser, lang, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(review.text || '');
  const [editRating, setEditRating] = useState(review.rating || 0);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const canManage = !!currentUser && (
    currentUser.id === review.user_id ||
    currentUser.id === review.created_by_id ||
    currentUser.role === 'admin'
  );

  const date = new Date(review.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const save = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    await onEdit(review.id, { text: editText.trim(), rating: editRating });
    setSaving(false);
    setEditing(false);
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSendingReply(true);
    await onReply(review.id, replyText.trim());
    setReplyText('');
    setShowReply(false);
    setSendingReply(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar src={review.user_avatar} name={review.user_name} />

      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-4">
          <div className="flex items-start gap-2 mb-2">
            <div className="min-w-0">
              <span className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] truncate block">
                {review.user_name || (lang === 'ru' ? 'Аноним' : 'Аноним')}
              </span>
              <span className="text-[11px] text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30">{date}</span>
            </div>
            {canManage && !editing && (
              <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                <button
                  onClick={() => { setEditing(true); setEditText(review.text || ''); setEditRating(review.rating || 0); }}
                  className="p-1.5 rounded-lg text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 hover:text-[#C5A059] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 rounded-lg text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 hover:text-[#E61D25] hover:bg-[#E61D25]/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div>
              <div className="mb-2"><Stars value={editRating} onChange={setEditRating} /></div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] resize-none"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={save}
                  disabled={saving || !editText.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {lang === 'ru' ? 'Сохранить' : 'Нигоҳ доштан'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50"
                >
                  <X className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Отмена' : 'Бекор'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-1.5"><Stars value={review.rating} /></div>
              <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 leading-relaxed whitespace-pre-wrap break-words">
                {review.text}
              </p>
            </>
          )}
        </div>

        {confirmDelete ? (
          <div className="flex items-center gap-3 mt-2 ml-2">
            <span className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
              {lang === 'ru' ? 'Удалить отзыв?' : 'Шарҳро нест кунам?'}
            </span>
            <button onClick={() => onDelete(review)} className="text-xs font-semibold text-[#E61D25] hover:underline">
              {lang === 'ru' ? 'Удалить' : 'Нест кардан'}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:underline">
              {lang === 'ru' ? 'Отмена' : 'Бекор'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-2 ml-2">
            <LikeButton liked={likes?.likedByMe} count={likes?.count} onClick={() => onToggleLike(review.id)} lang={lang} />
            <button
              onClick={() => setShowReply(!showReply)}
              className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#C5A059] transition-colors"
            >
              <Reply className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Ответить' : 'Ҷавоб додан'}
            </button>
          </div>
        )}

        {showReply && (
          <form onSubmit={sendReply} className="mt-2 ml-2 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={lang === 'ru' ? 'Напишите ответ...' : 'Ҷавоб нависед...'}
              className="flex-1 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
            />
            <button type="submit" disabled={sendingReply || !replyText.trim()} className="px-3 py-2 bg-[#C5A059] text-white rounded-lg text-sm disabled:opacity-50">
              {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}

        {replies?.length > 0 && (
          <div className="mt-3 ml-2 space-y-3">
            {replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                likes={repliesLikes(reply.id)}
                onToggleLike={onToggleLike}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FactoryComments({ factoryId }) {
  const { lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState(0);
  const [sortBy, setSortBy] = useState('newest');

  const load = async () => {
    const all = await base44.entities.Comment.filter({ factory_id: factoryId }, '-created_date');
    setComments(all);
    if (all.length > 0) {
      const allLikes = await base44.entities.ReviewLike.filter({ review_id: { $in: all.map((c) => c.id) } });
      setLikes(allLikes);
    } else {
      setLikes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [factoryId]);

  const likesFor = (id) => {
    const forId = likes.filter((l) => l.review_id === id);
    return { count: forId.length, likedByMe: !!user && forId.some((l) => l.user_id === user.id) };
  };

  const toggleLike = async (id) => {
    if (!isAuthenticated) return;
    const mine = likes.find((l) => l.review_id === id && l.user_id === user.id);
    if (mine) {
      await base44.entities.ReviewLike.delete(mine.id);
    } else {
      await base44.entities.ReviewLike.create({ review_id: id, user_id: user.id });
      const target = comments.find((c) => c.id === id);
      notifyComment({
        recipientId: target?.user_id,
        actor: user,
        type: 'like',
        commentId: id,
        itemType: 'factory',
        itemId: factoryId,
        text: target?.text,
      });
    }
    if (comments.length > 0) {
      const allLikes = await base44.entities.ReviewLike.filter({ review_id: { $in: comments.map((c) => c.id) } });
      setLikes(allLikes);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || rating === 0) return;
    setSubmitting(true);
    await base44.entities.Comment.create({
      factory_id: factoryId,
      user_id: user.id,
      user_name: user.full_name || user.email?.split('@')[0],
      user_avatar: user.avatar || '',
      text: text.trim(),
      rating,
      type: 'review',
    });
    setText('');
    setRating(0);
    setSubmitting(false);
    load();
  };

  const handleReply = async (parentId, replyText) => {
    await base44.entities.Comment.create({
      factory_id: factoryId,
      user_id: user.id,
      user_name: user.full_name || user.email?.split('@')[0],
      user_avatar: user.avatar || '',
      text: replyText,
      rating: 0,
      parent_id: parentId,
      type: 'reply',
    });
    const parent = comments.find((c) => c.id === parentId);
    notifyComment({
      recipientId: parent?.user_id,
      actor: user,
      type: 'reply',
      commentId: parentId,
      itemType: 'factory',
      itemId: factoryId,
      text: replyText,
    });
    load();
  };

  const handleEdit = async (id, payload) => {
    await base44.entities.Comment.update(id, payload);
    load();
  };

  const handleDelete = async (review) => {
    const children = comments.filter((c) => c.parent_id === review.id);
    for (const child of children) {
      await base44.entities.Comment.delete(child.id);
    }
    await base44.entities.Comment.delete(review.id);
    load();
  };

  const reviews = comments.filter((c) => !c.parent_id);
  const repliesFor = (id) => comments.filter((c) => c.parent_id === id);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating || 0) === star).length,
  }));

  let displayed = filter > 0 ? reviews.filter((r) => Math.round(r.rating || 0) === filter) : reviews;
  displayed = [...displayed].sort((a, b) => {
    if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'lowest') return (a.rating || 0) - (b.rating || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="h-px w-8 bg-[#C5A059]" />
        <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
          {lang === 'ru' ? 'Отзывы и комментарии' : 'Шарҳҳо ва баҳоҳо'}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Stars value={Math.round(avgRating)} />
            <span className="text-sm font-bold text-[#C5A059]">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">({reviews.length})</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilter(0)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 0 ? 'bg-[#C5A059] text-white' : 'bg-black/5 dark:bg-white/5 text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55'
          }`}
        >
          {lang === 'ru' ? 'Все оценки' : 'Ҳамаи баҳоҳо'} ({reviews.length})
        </button>
        {ratingCounts.map(({ star, count }) => (
          <button
            key={star}
            onClick={() => setFilter(star)}
            disabled={count === 0}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${
              filter === star ? 'bg-[#C5A059] text-white' : 'bg-black/5 dark:bg-white/5 text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55'
            }`}
          >
            {star} <Star className={`w-3 h-3 ${filter === star ? 'fill-white text-white' : 'fill-[#C5A059] text-[#C5A059]'}`} /> ({count})
          </button>
        ))}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9] text-xs focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
        >
          <option value="newest">{lang === 'ru' ? 'Сначала новые' : 'Аввал нав'}</option>
          <option value="highest">{lang === 'ru' ? 'Высокий рейтинг' : 'Баҳои баланд'}</option>
          <option value="lowest">{lang === 'ru' ? 'Низкий рейтинг' : 'Баҳои паст'}</option>
        </select>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Avatar src={user?.avatar} name={user?.full_name} size="w-9 h-9" />
            <span className="text-sm font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">{user?.full_name || user?.email}</span>
          </div>
          <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-1.5">
            {lang === 'ru' ? 'Ваша оценка' : 'Баҳои шумо'}
          </p>
          <div className="mb-3"><Stars value={rating} onChange={setRating} size="lg" /></div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={lang === 'ru' ? 'Напишите отзыв о заводе...' : 'Дар бораи завод шарҳ нависед...'}
            className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !text.trim() || rating === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {lang === 'ru' ? 'Оставить отзыв' : 'Баҳо гузоштан'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] text-center">
          <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
            {lang === 'ru' ? 'Войдите, чтобы оставить отзыв.' : 'Барои гузоштани баҳо ворид шавед.'}{' '}
            <a href="/login" className="text-[#E61D25] font-medium">{lang === 'ru' ? 'Войти' : 'Ворид шудан'}</a>
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#E61D25] animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-[#0A0A0A]/15 dark:text-[#F9F9F9]/15 mb-3" />
          <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            {filter > 0
              ? (lang === 'ru' ? 'Отзывов с такой оценкой нет' : 'Шарҳҳо бо ин баҳо нест')
              : (lang === 'ru' ? 'Пока нет отзывов. Будьте первым!' : 'Ҳоло шарҳ нест. Аввалин шавед!')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ReviewCard
                review={review}
                replies={repliesFor(review.id)}
                likes={likesFor(review.id)}
                repliesLikes={likesFor}
                onToggleLike={toggleLike}
                onReply={handleReply}
                currentUser={user}
                lang={lang}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}