import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion, useInView } from 'framer-motion';

function AnimatedNumber({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const num = parseInt(target.replace(/\D/g, '')) || 0;
    if (num === 0) { setCount(target); return; }
    const duration = 2000;
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        setCount(num);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  const display = typeof count === 'number' ? count.toLocaleString() + suffix : target;

  return <span ref={ref}>{display}</span>;
}

const stats = [
  { numKey: 'categoriesNum', labelKey: 'categories', subKey: 'categoriesSub', suffix: '+' },
  { numKey: 'deliveryNum', labelKey: 'delivery', subKey: 'deliverySub', suffix: '' },
  { numKey: 'suppliersNum', labelKey: 'suppliers', subKey: 'suppliersSub', suffix: '+' },
  { numKey: 'approachNum', labelKey: 'approach', subKey: 'approachSub', suffix: '%' },
];

export default function StatsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 lg:py-28 bg-[#0A0A0A] dark:bg-[#050505] relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E61D25] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => {
            const rawNum = t(`stats.${stat.numKey}`);
            const plainNum = rawNum.replace(/[+%]/g, '');
            return (
              <motion.div
                key={stat.numKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#F9F9F9] to-[#F9F9F9]/60 mb-2 font-mono">
                  <AnimatedNumber target={plainNum} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-[#C5A059] font-medium mb-1">{t(`stats.${stat.subKey}`)}</div>
                <div className="text-xs text-[#F9F9F9]/40">{t(`stats.${stat.labelKey}`)}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}