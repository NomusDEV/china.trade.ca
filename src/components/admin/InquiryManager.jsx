import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Inbox, CheckCircle, Clock, Trash2 } from 'lucide-react';
import moment from 'moment';
import AdminFilters, { inDateRange, textMatch } from '@/components/admin/AdminFilters';

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
  const [search, setSearch] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = inquiries.filter(
    (inq) =>
      textMatch(`${inq.name || ''} ${inq.phone || ''} ${inq.message || ''}`, search) &&
      (!fStatus || inq.status === fStatus) &&
      inDateRange(inq.created_date, from, to),
  );

  const updateStatus = async (id, status) => {
    await base44.entities.Inquiry.update(id, { status });
    onUpdate();
  };

  const deleteInquiry = async (id) => {
    await base44.entities.Inquiry.delete(id);
    onUpdate();
  };

  return (
    <div>
      <AdminFilters
        search={search}
        onSearch={setSearch}
        placeholder={lang === 'ru' ? 'Поиск по имени, телефону...' : 'Ҷустуҷӯ бо ном, телефон...'}
        filters={[
          {
            key: 'status',
            label: lang === 'ru' ? 'Все статусы' : 'Ҳама вазъиятҳо',
            value: fStatus,
            onChange: setFStatus,
            options: Object.entries(statusLabels.ru).map(([key, label]) => ({
              value: key,
              label: (statusLabels[lang] || statusLabels.ru)[key] || label,
            })),
          },
        ]}
        dateFrom={from}
        dateTo={to}
        onDateFrom={setFrom}
        onDateTo={setTo}
        count={filtered.length}
        total={inquiries.length}
      />

      <div className="space-y-2 max-h-[calc(100vh-400px)] min-h-[240px] overflow-y-auto pr-1">
        {filtered.map((inq) => (
          <div key={inq.id} className="p-3.5 rounded-md bg-white dark:bg-[#111111] border border-[#E4E1DA] dark:border-white/10">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <h3 className="font-medium text-[13px] text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{inq.name}</h3>
                <p className="text-[11px] text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                  {inq.phone} · {moment(inq.created_date).format('DD.MM.YYYY HH:mm')}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${statusColors[inq.status]}`}>
                {(statusLabels[lang] || statusLabels.ru)[inq.status]}
              </span>
            </div>
            <p className="text-[13px] text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 mb-2.5 whitespace-pre-wrap">{inq.message}</p>
            <div className="flex gap-1.5">
              {inq.status !== 'in_progress' && (
                <button onClick={() => updateStatus(inq.id, 'in_progress')} className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059]/20 transition-colors">
                  <Clock className="w-3 h-3" /> {lang === 'ru' ? 'В работу' : 'Ба кор'}
                </button>
              )}
              {inq.status !== 'completed' && (
                <button onClick={() => updateStatus(inq.id, 'completed')} className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">
                  <CheckCircle className="w-3 h-3" /> {lang === 'ru' ? 'Завершить' : 'Анҷом додан'}
                </button>
              )}
              <button onClick={() => deleteInquiry(inq.id)} className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] bg-[#E61D25]/10 text-[#E61D25] hover:bg-[#E61D25]/20 transition-colors ml-auto">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {inquiries.length === 0 && (
          <div className="text-center py-12 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            <Inbox className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-[13px]">{lang === 'ru' ? 'Нет заявок' : 'Дархост нест'}</p>
          </div>
        )}
        {inquiries.length > 0 && filtered.length === 0 && (
          <p className="text-center py-12 text-[13px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            {lang === 'ru' ? 'Ничего не найдено' : 'Чизе ёфт нашуд'}
          </p>
        )}
      </div>
    </div>
  );
}