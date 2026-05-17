import { useState } from 'react';
import { Navigate, useLocation, useOutletContext } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { t } = useOutletContext();
  const location = useLocation();
  const { isAuthenticated, startGithubLogin } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const returnTo = location.state?.returnTo || '/';

  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  const handleGithubLogin = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await startGithubLogin(returnTo);
    } catch {
      setError(t.login.error);
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-[76px] shrink-0 basis-[76px] items-center justify-end border-b border-[#dddddd] px-5 py-[18px]" />
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[rgba(77,93,250,0.02)] p-[15px]">
        <div className="flex w-[min(520px,100%)] flex-col items-center rounded-[15px] bg-white px-8 py-10 text-center shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
          <span className="mb-6 size-[70px] rounded-full bg-[linear-gradient(180deg,#4d5dfa_0%,#4d90fa_43%,#4da6fa_64%,#4dd2fa_95%,#69dcff_100%)] shadow-[2px_5px_13.5px_3px_rgba(77,135,250,0.25)]" />
          <h1 className="m-0 text-[24px] font-medium leading-8 text-[#212121]">{t.login.title}</h1>
          <p className="m-0 mt-3 max-w-[360px] text-[14px] font-light leading-[22px] text-[#8f8f8f]">{t.login.subtitle}</p>

          <button
            className="mt-8 inline-flex h-[50px] min-w-[220px] items-center justify-center rounded-full bg-white px-6 text-[15px] font-normal leading-6 text-[#212121] shadow-[0_0_6.4px_rgba(0,0,0,0.1)] transition hover:bg-[rgba(77,93,250,0.05)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa]"
            type="button"
            disabled={isSubmitting}
            onClick={handleGithubLogin}
          >
            {isSubmitting ? t.login.loading : t.login.githubButton}
          </button>

          {error && <p className="m-0 mt-4 text-[13px] font-light leading-5 text-[#f75555]">{error}</p>}
        </div>
      </div>
    </section>
  );
}
