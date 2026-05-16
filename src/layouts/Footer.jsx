import footerArrowDownIcon from '@/assets/icons/Arrow - Down 2.svg';
import footerRecordIcon from '@/assets/icons/Record Circle.svg';
import { LANGUAGES } from '@/constants/locales';
import { FlagIcon } from '@/components/FigmaIcons';

export default function Footer({ language, onLanguageChange, t }) {
  const currentLanguage = LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  return (
    <footer
      className="flex h-[86px] shrink-0 basis-[86px] items-end justify-between gap-6 border-t border-[#dddddd] bg-white px-5 py-[18px]"
      data-node-id="642:30590"
    >
      <div className="flex h-[50px] shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-light leading-[24px] text-[#212121]">
        <img className="size-5" src={footerRecordIcon} alt="" aria-hidden="true" />
        <span>{t.footer.copyright}</span>
      </div>

      <div className="flex h-[50px] w-[471px] shrink-0 items-center justify-between">
        <nav
          className="flex w-[308px] shrink-0 items-center justify-between whitespace-nowrap text-[13px] font-light leading-[24px] text-[#212121]"
          aria-label="Footer links"
        >
          <a href="#privacy">{t.footer.privacyPolicy}</a>
          <a href="#terms">{t.footer.termsOfService}</a>
          <a href="#cookies">{t.footer.cookieSettings}</a>
        </nav>
        <span className="block h-[35px] w-px shrink-0 bg-[#dddddd]" aria-hidden="true" />
        <label className="relative flex h-[42px] w-[129px] shrink-0 items-center justify-between overflow-hidden rounded-[10px] bg-white p-2.5">
          <span className="sr-only">{t.footer.language}</span>
          <FlagIcon code={currentLanguage.code} alt={currentLanguage.flagAlt} />
          <span className="whitespace-nowrap text-[13px] font-normal leading-[24px] text-[#212121]">{currentLanguage.label}</span>
          <img className="block size-4 shrink-0" src={footerArrowDownIcon} alt="" aria-hidden="true" />
          <select
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={t.footer.language}
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </footer>
  );
}
