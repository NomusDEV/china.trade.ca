import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, MessageCircle } from 'lucide-react';

const HERO_IMG = 'https://media.base44.com/images/public/6a3a2398a475362c0d768df6/7c2e72bf9_generated_48c3f022.png';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="Warehouse in China" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/70 to-[#0A0A0A]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
      </div>

      {/* Route line decoration */}
      <div className="absolute top-1/2 left-0 right-0 h-px">
        <motion.div
          className="h-full bg-gradient-to-r from-[#E61D25] via-[#C5A059] to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
          style={{ transformOrigin: 'left' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-sm font-medium tracking-widest uppercase">China.Trade.CA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
              {t('hero.title')}
            </h1>

            <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-2xl">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E61D25] to-[#E61D25]/80 text-white font-semibold rounded-xl hover:from-[#E61D25]/90 hover:to-[#E61D25]/70 transition-all duration-300 shadow-lg shadow-[#E61D25]/30 hover:shadow-[#E61D25]/50 text-sm sm:text-base"
              >
                <Search className="w-5 h-5" />
                {t('hero.findProduct')}
              </Link>
              <Link
                to="/contacts"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-sm sm:text-base"
              >
                <MessageCircle className="w-5 h-5" />
                {t('hero.contactUs')}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}