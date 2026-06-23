import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TelegramButton() {
  return (
    <motion.a
      href="https://t.me/chinatradeca"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#E61D25] to-[#C5A059] rounded-full flex items-center justify-center shadow-lg shadow-[#E61D25]/30 hover:shadow-[#E61D25]/50 transition-shadow"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </motion.a>
  );
}