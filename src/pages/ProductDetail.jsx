import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Package, ChevronLeft, ChevronRight, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '@/lib/CartContext.jsx';
import { useSiteSettings } from '@/lib/SiteSettingsContext.jsx';
import ProductComments from '@/components/product/ProductComments';

export default function ProductDetail() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const { telegramLink, whatsappLink } = useSiteSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    base44.entities.Product.get(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A]">
        <Package className="w-16 h-16 text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20 mb-4" />
        <p className="text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-4">Product not found</p>
        <Link to="/catalog" className="text-[#E61D25] text-sm">{t('product.back')}</Link>
      </div>
    );
  }

  const getName = () => (lang === 'tj' && product.name_tj) ? product.name_tj : product.name_ru;
  const getDesc = () => (lang === 'tj' && product.description_tj) ? product.description_tj : product.description_ru;
  const getSpecs = () => (lang === 'tj' && product.specifications_tj) ? product.specifications_tj : product.specifications_ru;
  const images = product.images?.length ? product.images : [];
  const telegramMsg = encodeURIComponent(`Здравствуйте! Меня интересует товар: ${product.name_ru} (ID: ${product.id})`);
  const whatsappMsg = encodeURIComponent(`Здравствуйте! Меня интересует товар: ${product.name_ru} (ID: ${product.id})`);
  const telegramHref = telegramLink !== '#' ? `${telegramLink}?text=${telegramMsg}` : '#';
  const whatsappHref = whatsappLink !== '#' ? `${whatsappLink}?text=${whatsappMsg}` : '#';

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:text-[#E61D25] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> {t('product.back')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F0F0F0] dark:bg-[#111111] mb-4">
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={getName()} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-[#0A0A0A]/10 dark:text-[#F9F9F9]/10" />
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === activeImage ? 'border-[#E61D25]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-xs text-[#C5A059] font-medium tracking-wider uppercase">{product.category}</span>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mt-2 mb-6">{getName()}</h1>

            <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10">
              <div>
                <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mb-1">{t('product.price')}</p>
                <span className="text-3xl font-bold text-[#E61D25]">${product.price}</span>
                <span className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 ml-1">/ {t('product.units')}</span>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mb-1">{t('product.moq')}</p>
                <span className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{product.moq}</span>
                <span className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 ml-1">{t('product.units')}</span>
              </div>
            </div>

            {getDesc() && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-3">{t('product.description')}</h3>
                <p className="text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 leading-relaxed whitespace-pre-wrap">{getDesc()}</p>
              </div>
            )}

            {getSpecs() && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-3">{t('product.specifications')}</h3>
                <p className="text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 leading-relaxed whitespace-pre-wrap">{getSpecs()}</p>
              </div>
            )}

            <div className="mb-6 p-5 rounded-2xl bg-[#F9F9F9] dark:bg-[#0A0A0A] border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5">
              <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-3">
                {t('product.quantity')} · {t('product.minOrder')}: {product.moq} {t('product.units')}
              </p>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setQty(Math.max(product.moq || 1, qty - 1))}
                  className="w-11 h-11 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 flex items-center justify-center text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={product.moq || 1}
                  value={qty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setQty(Math.max(product.moq || 1, val));
                  }}
                  className="w-24 text-center text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] bg-transparent border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 rounded-xl py-2 focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-11 h-11 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 flex items-center justify-center text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('product.totalCost')}</p>
                  <p className="text-2xl font-bold text-[#E61D25]">${(product.price * qty).toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  addItem(product, qty);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#C5A059] to-[#C5A059]/80 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#C5A059]/30 transition-all text-sm"
              >
                <ShoppingCart className="w-5 h-5" /> {added ? t('cart.addedToCart') : t('cart.addToCart')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#E61D25] to-[#E61D25]/80 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E61D25]/30 transition-all text-sm"
              >
                <MessageCircle className="w-5 h-5" /> {t('product.contactTelegram')}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 text-[#0A0A0A] dark:text-[#F9F9F9] font-semibold rounded-xl hover:border-[#C5A059] transition-all text-sm"
              >
                <MessageCircle className="w-5 h-5" /> {t('product.contactWhatsApp')}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Comments & Reviews */}
        <ProductComments productId={product.id} />
      </div>
    </div>
  );
}