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

const HERO_IMAGE = 'https://media.base44.com/images/public/6a3a2398a475362c0d768df6/55e87d9ba7d82e1e1813a310573d4863_generated_f47f8a05.jpg';

const BTN = 'inline-flex items-center gap-1.5 text-[11.5px] px-3 py-[7px] rounded-[2px] border border-[#C5A059] bg-[#C5A059] text-[#0B0C0E] font-semibold cursor-pointer transition-[background,box-shadow] duration-200 hover:bg-[#d6b26b] hover:shadow-[0_0_0_3px_rgba(197,160,89,0.18)] active:bg-[#b08c4a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8E6E1]';

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
      <div className="flex-1 pt-16 lg:pt-[68px] pb-16 bg-[#0B0C0E] flex items-center">
        <div className="max-w-md mx-auto px-4 text-center w-full">
          <ShieldAlert className="w-14 h-14 mx-auto text-[#C5A059]/50 mb-4" strokeWidth={1.6} />
          <h1 className="text-xl font-bold text-[#E8E6E1] mb-2">
            {lang === 'ru' ? 'Доступ запрещён' : 'Дастрасӣ манъ аст'}
          </h1>
          <p className="text-sm text-[#8a8780]">
            {lang === 'ru' ? 'Эта страница доступна только администраторам.' : 'Ин саҳифа танҳо барои администраторҳо дастрас аст.'}
          </p>
        </div>
      </div>
    );
  }

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label[lang] || tabs[0].label.ru;

  const chips = [
    { label: lang === 'ru' ? 'Товары' : 'Молҳо', value: products.length },
    { label: lang === 'ru' ? 'Заводы' : 'Заводҳо', value: factories.length },
    { label: lang === 'ru' ? 'Заказы' : 'Фармоишҳо', value: orders.length },
    { label: lang === 'ru' ? 'Заявки' : 'Дархостҳо', value: inquiries.length },
  ];

  return (
    <div className="flex-1 bg-[#0B0C0E] text-[#E8E6E1] pt-16 lg:pt-[68px]">
      <div className="mx-auto max-w-[1440px] min-h-[calc(100vh-68px)] flex flex-col lg:flex-row border border-[#23262b] shadow-[0_2px_14px_rgba(0,0,0,0.25)]">

        {/* Rail */}
        <aside className="admin-slide-in w-full lg:w-[96px] flex-none bg-[#0F1012] border-b lg:border-b-0 lg:border-r border-[#1c1f23] py-3 flex flex-row lg:flex-col gap-0.5 overflow-x-auto lg:overflow-visible">
          <div className="hidden lg:block text-[8.5px] tracking-[.18em] uppercase font-bold leading-[1.4] text-[#C5A059] px-2.5 pb-2.5 text-center">
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
                className={`relative flex flex-col items-center gap-1 w-full py-[9px] px-1 text-[9.5px] leading-[1.2] text-center whitespace-nowrap cursor-pointer transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#C5A059] active:bg-[#1b1e22] ${
                  on
                    ? 'bg-[#16181b] text-[#E8E6E1] font-semibold'
                    : 'text-[#8a8780] hover:bg-[#16181b] hover:text-[#E8E6E1]'
                }`}
              >
                {on && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#C5A059]" />}
                <Icon className={`w-[17px] h-[17px] flex-none ${on ? 'text-[#C5A059]' : ''}`} strokeWidth={1.6} />
                {tab.label[lang] || tab.label.ru}
                {badge > 0 && (
                  <span className="absolute top-[5px] right-4 min-w-[16px] h-4 px-1 rounded-[2px] bg-[#C5A059] text-[#0B0C0E] text-[9px] font-bold font-mono flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
          <Link
            to="/"
            className="hidden lg:flex flex-col items-center gap-1 mt-auto py-2.5 px-1 text-[9.5px] text-[#8a8780] transition-colors duration-200 hover:text-[#C5A059]"
          >
            <ArrowLeft className="w-[17px] h-[17px]" strokeWidth={1.6} />
            {lang === 'ru' ? 'На сайт' : 'Ба сайт'}
          </Link>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 px-5 pt-4 pb-6 flex flex-col gap-3">

          {/* Hero */}
          <section className="admin-rise relative overflow-hidden border border-[#23262b] rounded-[2px] px-[22px] py-[18px] min-h-[84px] flex items-center">
            <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#0B0C0E_28%,rgba(11,12,14,0.82)_60%,rgba(11,12,14,0.35))]" />
            <h1 className="relative text-[24px] leading-[1.1] font-bold tracking-[-0.01em] text-[#E8E6E1]">
              {lang === 'ru' ? 'Панель администратора' : 'Панели идоракунӣ'}
            </h1>
          </section>

          {/* Chips */}
          <section className="admin-rise grid grid-cols-2 md:grid-cols-4 gap-2" style={{ animationDelay: '.1s' }}>
            {chips.map((chip) => (
              <div
                key={chip.label}
                className="bg-[#131518] border border-[#23262b] rounded-[2px] px-3 py-[9px] flex items-baseline justify-between gap-2 transition-[background,box-shadow] duration-200 hover:bg-[#181b1f] hover:shadow-[inset_2px_0_0_#C5A059]"
              >
                <span className="text-[9.5px] tracking-[.22em] uppercase font-semibold leading-[1.4] text-[#8a8780]">
                  {chip.label}
                </span>
                <b className="admin-flick font-mono tabular-nums text-[20px] text-[#C5A059] font-semibold leading-[1.1]">
                  {chip.value}
                </b>
              </div>
            ))}
          </section>

          {/* Bar */}
          <section className="admin-rise flex items-center justify-between gap-3" style={{ animationDelay: '.18s' }}>
            <h2 className="text-[16px] font-bold leading-[1.2] text-[#E8E6E1]">{activeLabel}</h2>
            <div className="flex gap-1.5">
              <button onClick={() => setActiveTab('products')} className={BTN}>
                <Plus className="w-[13px] h-[13px]" strokeWidth={2} />
                {lang === 'ru' ? 'Добавить товар' : 'Мол илова кардан'}
              </button>
              <button onClick={() => navigate('/admin/factory/new')} className={BTN}>
                <Plus className="w-[13px] h-[13px]" strokeWidth={2} />
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
            <div className="admin-rise" style={{ animationDelay: '.18s' }}>
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