import React from 'react';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Factory, ClipboardCheck, Warehouse, ShoppingCart, Truck, Lightbulb } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';

const services = [
  { key: 'search', icon: Search },
  { key: 'verification', icon: ShieldCheck },
  { key: 'factory', icon: Factory },
  { key: 'qualityControl', icon: ClipboardCheck },
  { key: 'consolidation', icon: Warehouse },
  { key: 'purchasing', icon: ShoppingCart },
  { key: 'logistics', icon: Truck },
  { key: 'consulting', icon: Lightbulb },
];

export default function Services() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton to="/shop" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs font-semibold tracking-widest uppercase">Services</span>
            <div className="h-px w-12 bg-[#C5A059]" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-4">{t('services.title')}</h1>
          <p className="text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 max-w-2xl mx-auto">{t('services.subtitle')}</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#E61D25] via-[#C5A059] to-[#0A0A0A]/20 dark:to-[#F9F9F9]/10 hidden sm:block" />

          <div className="space-y-8 lg:space-y-12">
            {services.map((service, i) => {
              const Icon = service.icon;
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={service.key}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`relative flex items-start gap-6 sm:gap-8 lg:gap-0 ${
                    isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Step number */}
                  <div className="absolute left-3 sm:left-6 lg:left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center z-10 hidden sm:flex">
                    <span className="text-white text-[10px] font-bold">{i + 1}</span>
                  </div>

                  {/* Card */}
                  <div className={`flex-1 sm:ml-14 lg:ml-0 ${isLeft ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'}`}>
                    <div className="group p-6 lg:p-8 rounded-2xl border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 bg-white dark:bg-[#111111] hover:border-[#C5A059]/30 hover:shadow-xl hover:shadow-[#C5A059]/5 transition-all duration-500">
                      <div className={`flex items-center gap-4 mb-4 ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center flex-shrink-0 group-hover:from-[#E61D25]/20 group-hover:to-[#C5A059]/20 transition-all">
                          <Icon className="w-6 h-6 text-[#E61D25]" />
                        </div>
                        <div className="sm:hidden w-7 h-7 rounded-full bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">{i + 1}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t(`services.${service.key}`)}</h3>
                      </div>
                      <p className="text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 leading-relaxed">{t(`services.${service.key}Desc`)}</p>
                    </div>
                  </div>

                  {/* Spacer for other side */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}