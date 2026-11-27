import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { useUnreadMessages } from '@/lib/useUnreadMessages';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package, FolderOpen, Inbox, ShoppingCart, ShieldAlert, Settings,
  BarChart3, Users, MessageSquare, Factory, Sparkles, Plus, ArrowLeft,
} from 'lucide-react';
import CategoryManager from '@/components/admin/CategoryManager';
import InquiryManager from '@/components/admin/InquiryManager';
import OrderManager from '@/components/admin/OrderManager';
import SiteSettingsManager from '@/components/admin/SiteSettingsManager';
import MyListingsDashboard from '@/components/admin/MyListingsDashboard';
import ClientManager from '@/components/admin/ClientManager';
import MessageCenter from '@/components/admin/MessageCenter';
import FactoryManager from '@/components/admin/FactoryManager';
import ProductManager from '@/components/admin/ProductManager';
import AiGenerator from '@/components/admin/AiGenerator';

const HERO_IMAGE = 'https://media.base44.com/images/public/6a3a2398a475362c0d768df6/e52c33c7e80ddf1a773660076ebbdce5_generated_b893fafd.jpg';

const BTN = 'inline-flex items-center gap-2 text-[13px] px-4 py-2.5 rounded border border-[#0A0A0A]/15 bg-white text-[#0A0A0A] transition-colors duration-200 hover:bg-[#F3F2EF] hover:border-[#0A0A0A]/[0.33] active:bg-[#E9E7E2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059] dark:bg-[#141414] dark:text-[#F9F9F9] dark:border-white/15';
const BTN_PRI = 'inline-flex items-center gap-2 text-[13px] px-4 py-2.5 rounded border border-[#0A0A0A] bg-[#0A0A0A] text-white transition-colors duration-200 hover:bg-[#C5A059] hover:border-[#C5A059] active:bg-[#C5A059] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]';

const tabs = [
  { key: 'listings', icon: BarChart3, label: { ru: 'Мои объявления', tj: 'Эълонҳои ман' } },
  { key: 'clients', icon: Users, label: { ru: 'Клиенты', tj: 'Муштариён' } },
  { key: 'messages', icon: MessageSquare, label: { ru: 'Сообщения', tj: 'Паёмҳо' } },
  { key: 'products', icon: Package, label: { ru: 'Товары', tj: 'Молҳо' } },
  { key: 'factories', icon: Factory, label: { ru: 'Заводы', tj: 'Заводҳо' } },
  { key: 'categories', icon: FolderOpen, label: { ru: 'Категории', tj: 'Категорияҳо' } },
  { key: 'orders', icon: ShoppingCart, label: { ru: 'Заказы', tj: 'Фармоишҳо' } },
  { key: 'ai', icon: Sparkles, label: { ru: 'AI генератор', tj: 'Генератори ИИ' } },
  { key: 'inquiries', icon: Inbox, label: { ru: 'Заявки', tj: 'Дархостҳо' } },
  { key: 'settings', icon: Settings, label: { ru: 'Настройки', tj: 'Танзимотҳо' } },
];

export default function Admin() {
  const { lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useUnreadMessages();
  const [activeTab, setActiveTab] = useState('listings');
  const [products, setProducts] = useState([]);
  const [factories, setFactories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;

  const loadData = async () => {
    setLoading(true);
    const [prods, facs, cats, inqs, ords] = await Promise.all([
      base44.entities.Product.list('-created_date'),
      base44.entities.Factory.list('-created_date'),
      base44.entities.Category.list('order'),
      base44.entities.Inquiry.list('-created_date'),
      base44.entities.Order.list('-created_date'),
    ]);
    setProducts(prods);
    setFactories(facs);
    setCategories(cats);
    setInquiries(inqs);
    setOrders(ords);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex-1 pt-16 lg:pt-[68px] pb-16 bg-white dark:bg-[#0A0A0A] flex items-center">
        <div className="max-w-md mx-auto px-4 text-center w-full">
          <ShieldAlert className="w-14 h-14 mx-auto text-[#C5A059]/40 mb-4" strokeWidth={1.7} />
          <h1 className="text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-2">
            {lang === 'ru' ? 'Доступ запрещён' : 'Дастрасӣ манъ аст'}
          </h1>
          <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
            {lang === 'ru' ? 'Эта страница доступна только администраторам.' : 'Ин саҳифа танҳо барои администраторҳо дастрас аст.'}
          </p>
        </div>
      </div>
    );
  }

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label[lang] || tabs[0].label.ru;

  const stats = [
    { label: lang === 'ru' ? 'Товары' : 'Молҳо', value: products.length },
    { label: lang === 'ru' ? 'Заводы' : 'Заводҳо', value: factories.length },
    { label: lang === 'ru' ? 'Заказы' : 'Фармоишҳо', value: orders.length },
    { label: lang === 'ru' ? 'Заявки' : 'Дархостҳо', value: inquiries.length },
  ];

  return (
    <div className="flex-1 bg-white dark:bg-[#0A0A0A] pt-16 lg:pt-[68px]">
      <div className="mx-auto max-w-[1440px] flex flex-col lg:flex-row lg:min-h-[calc(100vh-68px)] border border-[#E4E1DA] dark:border-white/10">

        {/* Rail */}
        <aside className="admin-slide-in w-full lg:w-[236px] flex-shrink-0 bg-[#F3F2EF] dark:bg-[#111111] border-b lg:border-b-0 lg:border-r border-[#E4E1DA] dark:border-white/10 py-5 lg:py-7 flex flex-row lg:flex-col gap-0.5 overflow-x-auto lg:overflow-visible">
          <div className="hidden lg:block text-[11px] tracking-[.22em] uppercase font-bold leading-[1.4] text-[#0A0A0A] dark:text-[#F9F9F9] px-6 pb-[22px]">
            {lang === 'ru' ? 'Панель администратора' : 'Панели идоракунӣ'}
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const on = activeTab === tab.key;
            const badge = tab.key === 'messages' ? unreadCount : tab.key === 'orders' ? pendingOrders : 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-3 w-full px-4 lg:px-6 py-3 text-sm whitespace-nowrap text-left transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#C5A059] active:bg-[#0A0A0A]/[0.08] ${
                  on
                    ? 'bg-white dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-[#F9F9F9] font-semibold'
                    : 'text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:bg-[#0A0A0A]/[0.04] hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9]'
                }`}
              >
                {on && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#C5A059]" />}
                <Icon className="w-[17px] h-[17px] flex-none" strokeWidth={1.7} />
                {tab.label[lang] || tab.label.ru}
                {badge > 0 && (
                  <span className="ml-auto min-w-[18px] h-[18px] px-1.5 rounded-[9px] bg-[#C5A059] text-white text-[10px] font-bold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
          <Link
            to="/"
            className="hidden lg:flex items-center gap-3 px-6 py-3 mt-auto text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 transition-colors duration-200 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9]"
          >
            <ArrowLeft className="w-[17px] h-[17px]" strokeWidth={1.7} />
            {lang === 'ru' ? 'На сайт' : 'Ба сайт'}
          </Link>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-9 pt-6 lg:pt-7 pb-12 flex flex-col gap-6">

          {/* Hero */}
          <section className="admin-rise relative overflow-hidden border border-[#E4E1DA] dark:border-white/10 rounded-md px-8 py-[34px] flex items-center min-h-[150px]">
            <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover rounded-md" />
            <div className="absolute inset-0 rounded-md bg-[linear-gradient(90deg,#fff_30%,#ffffffcc_62%,#ffffff33)]" />
            <h1 className="relative text-[28px] lg:text-[34px] leading-[1.1] font-bold tracking-[-0.01em] text-[#0A0A0A]">
              {lang === 'ru' ? 'Панель администратора' : 'Панели идоракунӣ'}
            </h1>
          </section>

          {/* Stats */}
          <section className="admin-rise admin-d1 grid grid-cols-2 md:grid-cols-4 border border-[#E4E1DA] dark:border-white/10 rounded-md overflow-hidden">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`px-[22px] py-5 flex flex-col gap-1.5 transition-colors duration-200 hover:bg-[#F3F2EF] dark:hover:bg-white/[0.04] ${
                  i < stats.length - 1 ? 'border-r border-[#E4E1DA] dark:border-white/10' : ''
                } ${i % 2 === 1 ? 'border-r-0 md:border-r' : ''} ${i < 2 ? 'border-b md:border-b-0 border-[#E4E1DA] dark:border-white/10' : ''}`}
              >
                <span className="text-[10.5px] tracking-[.2em] uppercase font-semibold leading-[1.4] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60">
                  {stat.label}
                </span>
                <span className="text-[36px] font-bold tracking-[-0.02em] leading-[1.1] tabular-nums text-[#0A0A0A] dark:text-[#F9F9F9]">
                  {stat.value}
                </span>
              </div>
            ))}
          </section>

          {/* Bar */}
          <section className="admin-rise admin-d2 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[22px] font-bold leading-[1.2] text-[#0A0A0A] dark:text-[#F9F9F9]">{activeLabel}</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveTab('products')} className={BTN_PRI}>
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                {lang === 'ru' ? 'Добавить товар' : 'Мол илова кардан'}
              </button>
              <button onClick={() => navigate('/admin/factory/new')} className={BTN_PRI}>
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                {lang === 'ru' ? 'Добавить завод' : 'Завод илова кардан'}
              </button>
            </div>
          </section>

          {/* Tab content */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="admin-rise admin-d2">
              {activeTab === 'listings' && (
                <MyListingsDashboard
                  products={products}
                  factories={factories}
                  orders={orders}
                  inquiries={inquiries}
                  categories={categories}
                  onOpenProducts={() => setActiveTab('products')}
                />
              )}
              {activeTab === 'clients' && <ClientManager />}
              {activeTab === 'messages' && <MessageCenter />}
              {activeTab === 'products' && <ProductManager products={products} categories={categories} onUpdate={loadData} />}
              {activeTab === 'factories' && <FactoryManager />}
              {activeTab === 'categories' && <CategoryManager categories={categories} onUpdate={loadData} />}
              {activeTab === 'orders' && <OrderManager orders={orders} onUpdate={loadData} />}
              {activeTab === 'ai' && <AiGenerator onGenerated={loadData} />}
              {activeTab === 'inquiries' && <InquiryManager inquiries={inquiries} onUpdate={loadData} />}
              {activeTab === 'settings' && <SiteSettingsManager />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}