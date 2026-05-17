import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

function readRedirectedUser(searchParams) {
  const userParam = searchParams.get('user');

  if (!userParam) {
    return null;
  }

  try {
    return JSON.parse(userParam);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(userParam));
    } catch {
      return null;
    }
  }
}

export default function GithubCallbackPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeGithubLogin, saveAuthData } = useAuth();
  const [error, setError] = useState('');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    const accessToken = searchParams.get('accessToken') || searchParams.get('token');
    const redirectedUser = readRedirectedUser(searchParams);

    if (accessToken && redirectedUser) {
      saveAuthData({
        accessToken,
        user: redirectedUser,
      });
      window.sessionStorage.removeItem('auth.returnTo');
      window.alert('Đăng nhập thành công');
      navigate('/', { replace: true });
      return;
    }

    const code = searchParams.get('code');

    if (!code) {
      setError(t.login.error);
      return;
    }

    completeGithubLogin(code)
      .then(() => {
        window.sessionStorage.removeItem('auth.returnTo');
        window.alert('Đăng nhập thành công');
        navigate('/', { replace: true });
      })
      .catch(() => {
        setError(t.login.error);
      });
  }, [completeGithubLogin, navigate, saveAuthData, searchParams, t.login.error]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-[76px] shrink-0 basis-[76px] items-center justify-end border-b border-[#dddddd] px-5 py-[18px]" />
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[rgba(77,93,250,0.02)] p-[15px]">
        <div className="flex w-[min(520px,100%)] flex-col items-center rounded-[15px] bg-white px-8 py-10 text-center shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
          <span className="mb-6 size-[70px] rounded-full bg-[linear-gradient(180deg,#4d5dfa_0%,#4d90fa_43%,#4da6fa_64%,#4dd2fa_95%,#69dcff_100%)] shadow-[2px_5px_13.5px_3px_rgba(77,135,250,0.25)]" />
          <h1 className="m-0 text-[24px] font-medium leading-8 text-[#212121]">{t.login.callbackLoading}</h1>
          {error && <p className="m-0 mt-4 text-[13px] font-light leading-5 text-[#f75555]">{error}</p>}
        </div>
      </div>
    </section>
  );
}
