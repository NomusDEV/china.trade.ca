import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import TelegramButton from './TelegramButton';

export default function SiteLayout() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0A0A0A] transition-colors duration-500">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <TelegramButton />
    </div>
  );
}