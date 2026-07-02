import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import CountryCodeSelect from '@/components/CountryCodeSelect';
import { findCountryByIso } from '@/lib/countries';
import { Phone, Send, ShieldCheck, Loader2, CheckCircle, KeyRound } from 'lucide-react';

export default function PhoneVerification({ user, lang, t, onVerified }) {
  const [countryIso, setCountryIso] = useState(user?.country_iso || 'RU');
  const [phone, setPhone] = useState(user?.phone || '');
  const [step, setStep] = useState(user?.phone_verified ? 'verified' : 'input'); // input | code | verified
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');

  const country = findCountryByIso(countryIso);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await base44.functions.invoke('verifyPhone', {
        action: 'send',
        phone,
        country_code: country.dial,
        country_iso: countryIso,
      });
      if (res.data?.demo_code) {
        setDemoCode(res.data.demo_code);
      }
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setVerifying(true);
    setError('');
    try {
      await base44.functions.invoke('verifyPhone', {
        action: 'verify',
        phone,
        country_code: country.dial,
        country_iso: countryIso,
        code,
      });
      setStep('verified');
      onVerified?.();
    } catch (err) {
      setError(err.response?.data?.error || (lang === 'ru' ? 'Неверный код' : 'Коди нодуруст'));
    } finally {
      setVerifying(false);
    }
  };

  if (step === 'verified') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10">
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {lang === 'ru' ? 'Номер подтверждён' : 'Рақам тасдиқ шуд'}
          </p>
          <p className="text-xs text-green-600/60 dark:text-green-400/60">{country.flag} {country.dial} {phone}</p>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleVerify} className="space-y-3">
        <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
          {lang === 'ru' ? `Код отправлен на ${country.flag} ${country.dial} ${phone}` : `Код фиристода шуд ${country.flag} ${country.dial} ${phone}`}
        </p>
        {demoCode && (
          <div className="p-3 rounded-lg bg-[#C5A059]/10 text-[#C5A059] text-xs font-medium text-center">
            {lang === 'ru' ? 'Демо-режим: ваш код — ' : 'Режими демо: коди шумо — '}<span className="font-bold text-base tracking-widest">{demoCode}</span>
          </div>
        )}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm font-bold tracking-widest focus:outline-none focus:border-[#C5A059] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={verifying || code.length < 4}
            className="px-5 py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {t('cabinet.confirm')}
          </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="button" onClick={() => setStep('input')} className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#C5A059]">
          {lang === 'ru' ? '← Изменить номер' : '← Рақамро иваз кунед'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSend} className="space-y-3">
      <div className="flex gap-2">
        <CountryCodeSelect value={countryIso} onChange={setCountryIso} lang={lang} />
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="999 123 4567"
            className="w-full pl-10 pr-3 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={sending || !phone.trim()}
        className="w-full py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {t('cabinet.sendCode')}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}