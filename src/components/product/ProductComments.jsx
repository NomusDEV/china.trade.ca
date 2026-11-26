import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Reply, Send, Loader2, MessageCircle, Pencil, Trash2, Check, X, Heart } from 'lucide-react';

function StarRating({ value = 0, onChange, size = 'sm' }) {
  const [hover, setHover] = useState(0);
  const starSize = size === 'lg' ? 'w-7 h-7' : 'w-4 h-4';

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
          className={`${onChange ? 'cursor-pointer' : 'cursor-default'} transition-transform ${onChange ? 'hover:scale-110' : ''}`}
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

function CommentItem({ comment, replies, productId, likes, likesFor, onToggleLike, onReply, onEdit, onDelete, currentUser, lang, t, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text || '');
  const [editRating, setEditRating] = useState(comment.rating || 0);
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const date = new Date(comment.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const canManage = !!currentUser && (
    currentUser.id === comment.user_id ||
    currentUser.id === comment.created_by_id ||
    currentUser.role === 'admin'
  );

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyForm(false);
    setSubmitting(false);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setSavingEdit(true);
    const payload = { text: editText.trim() };
    if (comment.rating > 0) payload.rating = editRating;
    await onEdit(comment.id, payload);
    setSavingEdit(false);
    setEditing(false);
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 sm:ml-12' : ''}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
        {comment.user_avatar ? (
          <img src={comment.user_avatar} alt={comment.user_name || ''} className="w-full h-full object-cover" />
        ) : (
          (comment.user_name || '?').charAt(0).toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] p-3 sm:p-4">
          <div className="flex items-start gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{comment.user_name || (lang === 'ru' ? 'Аноним' : 'Аноним')}</span>
              <span className="text-xs text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0">{date}</span>
            </div>
            {canManage && !editing && (
              <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                <button
                  onClick={() => { setEditing(true); setEditText(comment.text || ''); setEditRating(comment.rating || 0); }}
                  title={lang === 'ru' ? 'Редактировать' : 'Таҳрир кардан'}
                  className="p-1.5 rounded-lg text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 hover:text-[#C5A059] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  title={lang === 'ru' ? 'Удалить' : 'Нест кардан'}
                  className="p-1.5 rounded-lg text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 hover:text-[#E61D25] hover:bg-[#E61D25]/5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div>
              {comment.rating > 0 && (
                <div className="mb-2">
                  <StarRating value={editRating} onChange={setEditRating} />
                </div>
              )}
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] resize-none"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editText.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {lang === 'ru' ? 'Сохранить' : 'Нигоҳ доштан'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9]"
                >
                  <X className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Отмена' : 'Бекор'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {comment.rating > 0 && (
                <div className="mb-2">
                  <StarRating value={comment.rating} />
                </div>
              )}
              <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
            </>
          )}
        </div>

        {confirmDelete ? (
          <div className="flex items-center gap-3 mt-2 ml-2">
            <span className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
              {lang === 'ru' ? 'Удалить навсегда?' : 'Тамоман нест кунам?'}
            </span>
            <button onClick={() => onDelete(comment)} className="text-xs font-semibold text-[#E61D25] hover:underline">
              {lang === 'ru' ? 'Удалить' : 'Нест кардан'}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:underline">
              {lang === 'ru' ? 'Отмена' : 'Бекор'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-1.5 ml-2">
            <button
              onClick={() => onToggleLike(comment.id)}
              className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                likes?.likedByMe ? 'text-[#E61D25]' : 'text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${likes?.likedByMe ? 'fill-[#E61D25]' : ''}`} /> {likes?.count || 0}
            </button>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#C5A059] transition-colors"
            >
              <Reply className="w-3.5 h-3.5" /> {t('comments.reply')}
            </button>
          </div>
        )}

        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-2 ml-2 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t('comments.writeReply')}
              className="flex-1 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
            />
            <button type="submit" disabled={submitting || !replyText.trim()} className="px-3 py-2 bg-[#C5A059] text-white rounded-lg text-sm disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}

        {replies?.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]}
                productId={productId}
                likes={likesFor ? likesFor(reply.id) : undefined}
                likesFor={likesFor}
                onToggleLike={onToggleLike}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                currentUser={currentUser}
                lang={lang}
                t={t}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductComments({ productId }) {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews'); // reviews | comments
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    loadComments();
  }, [productId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Comment.filter({ product_id: productId }, '-created_date');
      setComments(all);
      if (all.length > 0) {
        const allLikes = await base44.entities.ReviewLike.filter({ review_id: { $in: all.map((c) => c.id) } });
        setLikes(allLikes);
      } else {
        setLikes([]);
      }
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    await base44.entities.Comment.create({
      product_id: productId,
      user_id: user.id,
      user_name: user.full_name || user.email?.split('@')[0],
      user_avatar: user.avatar || '',
      text: text.trim(),
      rating: activeTab === 'reviews' ? rating : 0,
      type: activeTab === 'reviews' ? 'review' : 'comment',
    });
    setText('');
    setRating(0);
    setSubmitting(false);
    loadComments();
  };

  const handleReply = async (parentId, replyText) => {
    await base44.entities.Comment.create({
      product_id: productId,
      user_id: user.id,
      user_name: user.full_name || user.email?.split('@')[0],
      user_avatar: user.avatar || '',
      text: replyText.trim(),
      rating: 0,
      parent_id: parentId,
      type: 'reply',
    });
    loadComments();
  };

  const handleEdit = async (id, payload) => {
    await base44.entities.Comment.update(id, payload);
    loadComments();
  };

  const handleDelete = async (comment) => {
    const children = comments.filter((c) => c.parent_id === comment.id);
    for (const child of children) {
      await base44.entities.Comment.delete(child.id);
    }
    await base44.entities.Comment.delete(comment.id);
    loadComments();
  };

  // Top-level comments only (no parent_id)
  const topLevel = comments.filter((c) => !c.parent_id);
  const reviews = topLevel.filter((c) => c.type === 'review' || c.rating > 0);
  const plainComments = topLevel.filter((c) => c.type === 'comment' || (c.type !== 'review' && c.rating === 0));

  let displayed = activeTab === 'reviews' ? reviews : plainComments;
  if (activeTab === 'reviews' && ratingFilter > 0) {
    displayed = displayed.filter((c) => Math.round(c.rating || 0) === ratingFilter);
  }
  displayed = [...displayed].sort((a, b) => {
    if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'lowest') return (a.rating || 0) - (b.rating || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating || 0) === star).length,
  }));

  const getReplies = (commentId) => comments.filter((c) => c.parent_id === commentId);

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
    }
    if (comments.length > 0) {
      const allLikes = await base44.entities.ReviewLike.filter({ review_id: { $in: comments.map((c) => c.id) } });
      setLikes(allLikes);
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-8 bg-[#C5A059]" />
        <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
          {t('comments.title')}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-sm font-bold text-[#C5A059]">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'reviews' ? 'bg-[#E61D25] text-white' : 'bg-black/5 dark:bg-white/5 text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60'
          }`}
        >
          <Star className="w-4 h-4" /> {t('comments.reviews')} ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'comments' ? 'bg-[#E61D25] text-white' : 'bg-black/5 dark:bg-white/5 text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60'
          }`}
        >
          <MessageCircle className="w-4 h-4" /> {t('comments.comments')} ({plainComments.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {activeTab === 'reviews' && (
          <>
            <button
              onClick={() => setRatingFilter(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                ratingFilter === 0
                  ? 'bg-[#C5A059] text-white'
                  : 'bg-black/5 dark:bg-white/5 text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55 hover:bg-black/10'
              }`}
            >
              {lang === 'ru' ? 'Все оценки' : 'Ҳамаи баҳоҳо'} ({reviews.length})
            </button>
            {ratingCounts.map(({ star, count }) => (
              <button
                key={star}
                onClick={() => setRatingFilter(star)}
                disabled={count === 0}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${
                  ratingFilter === star
                    ? 'bg-[#C5A059] text-white'
                    : 'bg-black/5 dark:bg-white/5 text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55 hover:bg-black/10'
                }`}
              >
                {star} <Star className={`w-3 h-3 ${ratingFilter === star ? 'fill-white text-white' : 'fill-[#C5A059] text-[#C5A059]'}`} /> ({count})
              </button>
            ))}
          </>
        )}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9] text-xs focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
        >
          <option className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value="newest">{lang === 'ru' ? 'Сначала новые' : 'Аввал нав'}</option>
          <option className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value="highest">{lang === 'ru' ? 'Высокий рейтинг' : 'Баҳои баланд'}</option>
          <option className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value="lowest">{lang === 'ru' ? 'Низкий рейтинг' : 'Баҳои паст'}</option>
        </select>
      </div>

      {/* Write form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user?.full_name || '?').charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">{user?.full_name || user?.email}</span>
          </div>
          {activeTab === 'reviews' && (
            <div className="mb-3">
              <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-1.5">{t('comments.yourRating')}</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={activeTab === 'reviews' ? t('comments.writeReview') : t('comments.writeComment')}
            className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !text.trim() || (activeTab === 'reviews' && rating === 0)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {activeTab === 'reviews' ? t('comments.postReview') : t('comments.postComment')}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] text-center">
          <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
            {t('comments.loginToPost')} <a href="/login" className="text-[#E61D25] font-medium">{t('auth.login')}</a>
          </p>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#E61D25] animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-[#0A0A0A]/15 dark:text-[#F9F9F9]/15 mb-3" />
          <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            {ratingFilter > 0
              ? (lang === 'ru' ? 'Отзывов с такой оценкой нет' : 'Шарҳҳо бо ин баҳо нест')
              : t('comments.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {displayed.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CommentItem
                comment={comment}
                replies={getReplies(comment.id)}
                productId={productId}
                likes={likesFor(comment.id)}
                likesFor={likesFor}
                onToggleLike={toggleLike}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUser={user}
                lang={lang}
                t={t}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}