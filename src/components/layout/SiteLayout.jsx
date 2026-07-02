import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import TelegramButton from './TelegramButton';

export default function SiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9] dark:bg-[#0A0A0A] transition-colors duration-500">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <TelegramButton />
    </div>
  );
}