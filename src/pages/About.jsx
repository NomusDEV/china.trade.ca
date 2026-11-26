import React from 'react';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Award, Users, Globe, Eye } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';

const ABOUT_IMG = 'https://media.base44.com/images/public/6a3a2398a475362c0d768df6/9cefe8582_generated_be6c034c.png';
const QC_IMG = 'https://media.base44.com/images/public/6a3a2398a475362c0d768df6/4b7aab00c_generated_c2fd9f8c.png';

const whyUsItems = [
  { key: 'experience', icon: Award },
  { key: 'team', icon: Users },
  { key: 'network', icon: Globe },
  { key: 'transparency', icon: Eye },
];

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton to="/" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs font-semibold tracking-widest uppercase">About</span>
            <div className="h-px w-12 bg-[#C5A059]" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('about.title')}</h1>
        </motion.div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl overflow-hidden">
              <img src={ABOUT_IMG} alt="About China Trade CA" className="w-full h-80 lg:h-96 object-cover" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-lg text-[#0A0A0A]/80 dark:text-[#F9F9F9]/80 leading-relaxed mb-8">{t('about.text')}</p>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E61D25]/5 to-[#C5A059]/5 border border-[#C5A059]/20">
              <h3 className="text-sm font-semibold text-[#C5A059] uppercase tracking-wider mb-3">{t('about.mission')}</h3>
              <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 leading-relaxed">{t('about.missionText')}</p>
            </div>
          </motion.div>
        </div>

        {/* Why Us */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#0A0A0A] dark:text-[#F9F9F9] mb-12">{t('about.whyUs')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUsItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-2xl border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 bg-white dark:bg-[#111111]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-[#E61D25]" />
                  </div>
                  <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t(`about.${item.key}`)}</h3>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quality Image */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-20">
          <div className="rounded-2xl overflow-hidden">
            <img src={QC_IMG} alt="Quality Control" className="w-full h-64 lg:h-80 object-cover" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}