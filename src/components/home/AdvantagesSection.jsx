import React from 'react';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, Factory, BadgeDollarSign, ShieldCheck, Truck, Globe } from 'lucide-react';

const advantages = [
  { key: 'search', icon: Search },
  { key: 'direct', icon: Factory },
  { key: 'prices', icon: BadgeDollarSign },
  { key: 'quality', icon: ShieldCheck },
  { key: 'delivery', icon: Truck },
  { key: 'china', icon: Globe },
];

export default function AdvantagesSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs font-semibold tracking-widest uppercase">Benefits</span>
            <div className="h-px w-12 bg-[#C5A059]" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
            {t('advantages.title')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((adv, i) => {
            const Icon = adv.icon;
            return (
              <motion.div
                key={adv.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 bg-[#F9F9F9] dark:bg-[#0A0A0A] hover:border-[#C5A059]/30 hover:shadow-xl hover:shadow-[#C5A059]/5 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center mb-5 group-hover:from-[#E61D25]/20 group-hover:to-[#C5A059]/20 transition-all duration-500">
                  <Icon className="w-6 h-6 text-[#E61D25]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-2">
                  {t(`advantages.${adv.key}`)}
                </h3>
                <p className="text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 leading-relaxed">
                  {t(`advantages.${adv.key}Desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}