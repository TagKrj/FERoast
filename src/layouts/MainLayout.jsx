import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { DEFAULT_LANGUAGE, TEXTS } from '@/constants/locales';
import Footer from '@/layouts/Footer';
import Header from '@/layouts/Header';
import Sidebar from '@/layouts/Sidebar';

export default function MainLayout() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const t = useMemo(() => TEXTS[language] || TEXTS[DEFAULT_LANGUAGE], [language]);
  const navigate = useNavigate();
  const location = useLocation();
  const openLogin = () => navigate('/login', { state: { returnTo: location.pathname } });

  return (
    <div className="min-h-screen bg-white">
      <Header t={t} onLoginClick={openLogin} />
      <div className="flex min-h-[calc(100vh-87px)] gap-2.5 overflow-x-auto bg-white py-2.5 pl-2.5 pr-[11px] max-[760px]:pr-2.5">
        <Sidebar t={t} />
        <main className="flex h-[calc(100vh-107px)] min-h-[793px] w-[calc(100vw-120px)] min-w-[920px] flex-1 shrink-0 flex-col overflow-hidden rounded-[15px] border border-[rgba(221,221,221,0.87)] bg-white max-[1120px]:min-w-[880px] max-[760px]:min-w-[720px]">
          <Outlet context={{ t }} />
          <Footer language={language} onLanguageChange={setLanguage} t={t} />
        </main>
      </div>
    </div>
  );
}
