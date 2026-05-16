import headerLogoImage from '@/assets/imgs/ChatGPT Image 13_41_51 15 thg 5, 2026 1.svg';
import headerBellImage from '@/assets/icons/Bell.svg';
import headerAvatarImage from '@/assets/imgs/Avatars.svg';

export default function Header({ t }) {
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

      <div className="flex h-[50px] w-[149px] shrink-0 items-center justify-between">
        <button
          className="inline-flex size-[50px] items-center justify-center rounded-full bg-white shadow-[0_0_6.4px_rgba(0,0,0,0.1)] hover:bg-[rgba(77,93,250,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa]"
          type="button"
          aria-label={t.header.notifications}
        >
          <img className="size-6" src={headerBellImage} alt="" aria-hidden="true" />
        </button>
        <span className="block h-[35px] w-px shrink-0 bg-[#dddddd]" aria-hidden="true" />
        <img className="block size-[50px] shrink-0 rounded-full object-contain" src={headerAvatarImage} alt={t.header.avatarAlt} />
      </div>
    </header>
  );
}
