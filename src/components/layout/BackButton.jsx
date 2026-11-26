import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function BackButton({ to = '/', className = '' }) {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const goBack = () => {
    // Return exactly where the user came from; fall back to the given route.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-2 text-sm font-medium text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55 hover:text-[#E61D25] transition-colors mb-6 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {lang === 'ru' ? 'Назад' : 'Бозгашт'}
    </button>
  );
}