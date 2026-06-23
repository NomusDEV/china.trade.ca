import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import AdvantagesSection from '@/components/home/AdvantagesSection';
import StatsSection from '@/components/home/StatsSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <AdvantagesSection />
      <StatsSection />
    </>
  );
}