import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Reply, Send, Loader2, MessageCircle } from 'lucide-react';

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

function CommentItem({ comment, replies, productId, onReply, lang, t, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const date = new Date(comment.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText);
    setReplyText('');
    setShowReplyForm(false);
    setSubmitting(false);
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 sm:ml-12' : ''}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
        {comment.user_avatar ? (
          <img src={comment.user_avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          (comment.user_name || '?').charAt(0).toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{comment.user_name || (lang === 'ru' ? 'Аноним' : 'Аноним')}</span>
            <span className="text-xs text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30">{date}</span>
          </div>
          {comment.rating > 0 && (
            <div className="mb-2">
              <StarRating value={comment.rating} />
            </div>
          )}
          <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
        </div>

        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-1.5 mt-1.5 ml-2 text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#C5A059] transition-colors"
        >
          <Reply className="w-3.5 h-3.5" /> {t('comments.reply')}
        </button>

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
              <CommentItem key={reply.id} comment={reply} replies={[]} productId={productId} onReply={onReply} lang={lang} t={t} depth={depth + 1} />
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

  useEffect(() => {
    loadComments();
  }, [productId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Comment.filter({ product_id: productId }, '-created_date');
      setComments(all);
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

  // Top-level comments only (no parent_id)
  const topLevel = comments.filter((c) => !c.parent_id);
  const reviews = topLevel.filter((c) => c.type === 'review' || c.rating > 0);
  const plainComments = topLevel.filter((c) => c.type === 'comment' || (c.type !== 'review' && c.rating === 0));

  const displayed = activeTab === 'reviews' ? reviews : plainComments;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : 0;

  const getReplies = (commentId) => comments.filter((c) => c.parent_id === commentId);

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
      <div className="flex gap-2 mb-6">
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
          <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('comments.empty')}</p>
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
                onReply={handleReply}
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