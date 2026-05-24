import headerLogoImage from '@/assets/imgs/ChatGPT Image 13_41_51 15 thg 5, 2026 1.svg';
import headerBellImage from '@/assets/icons/Bell.svg';
import githubIcon from '@/assets/icons/github.svg';
import { useAuth } from '@/hooks/useAuth';

export default function Header({ onLoginClick, t }) {
  const { isAuthenticated, user } = useAuth();

  return (
    <header
      className="flex h-[87px] items-center justify-between border-b border-[#dddddd] bg-white px-5 max-[760px]:px-3.5"
      data-node-id="641:30047"
    >
      <div className="flex w-[214px] shrink-0 items-center gap-2.5 max-[760px]:w-auto">
        <img className="block size-[50px] shrink-0 rounded-full object-cover" src={headerLogoImage} alt={t.brand.logoAlt} />
        <span className="whitespace-nowrap text-[24px] font-medium leading-[24px] text-[#212121] max-[760px]:text-[20px]">
          {t.brand.name}
        </span>
      </div>

      <div className="flex h-[50px] shrink-0 items-center gap-3">
        <button
          className="inline-flex size-[50px] items-center justify-center rounded-full bg-white shadow-[0_0_6.4px_rgba(0,0,0,0.1)] hover:bg-[rgba(77,93,250,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa]"
          type="button"
          aria-label={t.header.notifications}
        >
          <img className="size-6" src={headerBellImage} alt="" aria-hidden="true" />
        </button>
        <span className="block h-[35px] w-px shrink-0 bg-[#dddddd]" aria-hidden="true" />
        {isAuthenticated && user?.avatarUrl ? (
          <img className="block size-[50px] shrink-0 rounded-full object-cover" src={user?.avatarUrl} alt={t.header.avatarAlt} />
        ) : isAuthenticated ? (
          <span className="inline-flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[#4d5dfa] text-[16px] font-medium text-white">
            {(user?.name || user?.github?.username || 'U').slice(0, 1).toUpperCase()}
          </span>
        ) : (
          <button
            className="inline-flex h-[50px] w-fit shrink-0 items-center justify-center gap-2.5 rounded-full bg-white px-5 text-[14px] font-normal leading-6 text-[#212121] shadow-[0_0_6.4px_rgba(0,0,0,0.1)] transition hover:bg-[rgba(77,93,250,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa]"
            type="button"
            onClick={onLoginClick}
          >
            <img src={githubIcon} className="h-5 w-5" alt="GitHub" />
            {t.header.login}
          </button>
        )}
      </div>
    </header>
  );
}
