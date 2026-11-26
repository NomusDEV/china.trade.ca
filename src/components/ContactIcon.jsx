import React from 'react';
import { Send, MessageCircle, MessageSquare, Mail, Globe, Phone } from 'lucide-react';

const config = {
  telegram: { Icon: Send, bg: 'bg-[#229ED9]' },
  whatsapp: { Icon: MessageCircle, bg: 'bg-[#25D366]' },
  wechat: { Icon: MessageSquare, bg: 'bg-[#07C160]' },
  email: { Icon: Mail, bg: 'bg-[#C5A059]' },
  website: { Icon: Globe, bg: 'bg-[#0A0A0A]' },
  phone: { Icon: Phone, bg: 'bg-[#E61D25]' },
};

export default function ContactIcon({ type = 'website', size = 'md' }) {
  const { Icon, bg } = config[type] || config.website;
  const box = size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl';
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className={`${box} ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`${icon} text-white`} />
    </div>
  );
}