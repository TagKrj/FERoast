import { BrowserRouter, Route, Routes } from 'react-router-dom';

import MainLayout from '@/layouts/MainLayout';
import GithubCallbackPage from '@/pages/GithubCallbackPage';
import HistoryPage from '@/pages/HistoryPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import ResultPage from '@/pages/ResultPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="callback" element={<GithubCallbackPage />} />
          <Route path="auth/github/callback" element={<GithubCallbackPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="result" element={<ResultPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
