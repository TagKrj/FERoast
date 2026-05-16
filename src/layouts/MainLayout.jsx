import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { DEFAULT_LANGUAGE, TEXTS } from '@/constants/locales';
import Footer from '@/layouts/Footer';
import Header from '@/layouts/Header';
import Sidebar from '@/layouts/Sidebar';

export default function MainLayout() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const t = useMemo(() => TEXTS[language] || TEXTS[DEFAULT_LANGUAGE], [language]);

  return (
    <div className="app-shell">
      <Header t={t} />
      <div className="app-workspace">
        <Sidebar t={t} />
        <main className="main-panel">
          <Outlet context={{ t }} />
          <Footer language={language} onLanguageChange={setLanguage} t={t} />
        </main>
      </div>
    </div>
  );
}
