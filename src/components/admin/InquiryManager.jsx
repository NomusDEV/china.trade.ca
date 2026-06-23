import React from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Inbox, CheckCircle, Clock, Trash2 } from 'lucide-react';
import moment from 'moment';

const statusColors = {
  new: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-[#C5A059]/10 text-[#C5A059]',
  completed: 'bg-green-500/10 text-green-500',
};

const statusLabels = {
  ru: { new: 'Новая', in_progress: 'В работе', completed: 'Завершена' },
  tj: { new: 'Нав', in_progress: 'Дар кор', completed: 'Анҷомёфта' },
};

export default function InquiryManager({ inquiries, onUpdate }) {
  const { lang } = useLanguage();

  const updateStatus = async (id, status) => {
    await base44.entities.Inquiry.update(id, { status });
    onUpdate();
  };

  const deleteInquiry = async (id) => {
    await base44.entities.Inquiry.delete(id);
    onUpdate();
  };

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <div key={inq.id} className="p-5 rounded-xl bg-white dark:bg-[#111111] border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-sm text-[#0A0A0A] dark:text-[#F9F9F9]">{inq.name}</h3>
              <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{inq.phone} · {moment(inq.created_date).format('DD.MM.YYYY HH:mm')}</p>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-medium ${statusColors[inq.status]}`}>
              {(statusLabels[lang] || statusLabels.ru)[inq.status]}
            </span>
          </div>
          <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 mb-4">{inq.message}</p>
          <div className="flex gap-2">
            {inq.status !== 'in_progress' && (
              <button onClick={() => updateStatus(inq.id, 'in_progress')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059]/20 transition-colors">
                <Clock className="w-3 h-3" /> {lang === 'ru' ? 'В работу' : 'Ба кор'}
              </button>
            )}
            {inq.status !== 'completed' && (
              <button onClick={() => updateStatus(inq.id, 'completed')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">
                <CheckCircle className="w-3 h-3" /> {lang === 'ru' ? 'Завершить' : 'Анҷом додан'}
              </button>
            )}
            <button onClick={() => deleteInquiry(inq.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#E61D25]/10 text-[#E61D25] hover:bg-[#E61D25]/20 transition-colors ml-auto">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
      {inquiries.length === 0 && (
        <div className="text-center py-12 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{lang === 'ru' ? 'Нет заявок' : 'Дархост нест'}</p>
        </div>
      )}
    </div>
  );
}