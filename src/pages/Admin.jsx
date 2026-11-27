import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, FolderOpen, Inbox, X, Upload, Image, ShoppingCart, ShieldAlert, Settings, BarChart3, Users, MessageSquare, Factory, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useUnreadMessages } from '@/lib/useUnreadMessages';
import { useSiteSettings } from '@/lib/SiteSettingsContext.jsx';
import ProductForm from '@/components/admin/ProductForm';
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
import BackButton from '@/components/layout/BackButton';

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
  const unreadCount = useUnreadMessages();
  const [activeTab, setActiveTab] = useState('listings');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [confirmProduct, setConfirmProduct] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats, inqs, ords] = await Promise.all([
      base44.entities.Product.list('-created_date'),
      base44.entities.Category.list('order'),
      base44.entities.Inquiry.list('-created_date'),
      base44.entities.Order.list('-created_date'),
    ]);
    setProducts(prods);
    setCategories(cats);
    setInquiries(inqs);
    setOrders(ords);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A] flex items-center">
        <div className="max-w-md mx-auto px-4 text-center w-full">
          <ShieldAlert className="w-16 h-16 mx-auto text-[#E61D25]/30 mb-4" />
          <h1 className="text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-2">
            {lang === 'ru' ? 'Доступ запрещён' : 'Дастрасӣ манъ аст'}
          </h1>
          <p className="text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 text-sm">
            {lang === 'ru' ? 'Эта страница доступна только администраторам.' : 'Ин саҳифа танҳо барои администраторҳо дастрас аст.'}
          </p>
        </div>
      </div>
    );
  }

  const deleteProduct = async (id) => {
    await base44.entities.Product.delete(id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleProductSaved = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadData();
  };

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton to="/" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
            {lang === 'ru' ? 'Панель администратора' : 'Панели идоракунӣ'}
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#0A0A0A]/10 dark:bg-white/10 text-[#0A0A0A] dark:text-[#F9F9F9] font-semibold'
                    : 'bg-black/[0.03] dark:bg-white/[0.03] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label[lang] || tab.label.ru}
                {tab.key === 'messages' && unreadCount > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] px-1 bg-[#E61D25] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {tab.key === 'orders' && pendingOrders > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] px-1 bg-[#E61D25] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingOrders > 9 ? '9+' : pendingOrders}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Products Tab */}
            {activeTab === 'products' && (
              <ProductManager products={products} categories={categories} onUpdate={loadData} />
            )}

            {activeTab === 'listings' && <MyListingsDashboard products={products} orders={orders} inquiries={inquiries} categories={categories} />}
            {activeTab === 'clients' && <ClientManager />}
            {activeTab === 'factories' && <FactoryManager />}
            {activeTab === 'messages' && <MessageCenter />}
            {activeTab === 'categories' && <CategoryManager categories={categories} onUpdate={loadData} />}
            {activeTab === 'orders' && <OrderManager orders={orders} onUpdate={loadData} />}
            {activeTab === 'inquiries' && <InquiryManager inquiries={inquiries} onUpdate={loadData} />}
            {activeTab === 'ai' && <AiGenerator onGenerated={loadData} />}
            {activeTab === 'settings' && <SiteSettingsManager />}
          </>
        )}
      </div>
    </div>
  );
}