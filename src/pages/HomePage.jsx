import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import addCircleIcon from '@/assets/icons/Add Circle.svg';
import gptIcon from '@/assets/icons/GPT.svg';
import playIcon from '@/assets/icons/Play.svg';
import starsIcon from '@/assets/icons/Stars.svg';
import sendArrowIcon from '@/assets/icons/Vector.svg';
import { useAuth } from '@/hooks/useAuth';
import { useRepoCheck } from '@/hooks/useRepoCheck';

const SIZE_TONE_CLASS = {
  danger: 'text-[#f75555]',
  warning: 'text-[#ff981f]',
  success: 'text-[#049c6b]',
};

export default function HomePage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, user } = useAuth();
  const { checkRepo, isChecking } = useRepoCheck();
  const [currentStep, setCurrentStep] = useState(1);
  const [repoUrl, setRepoUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [checkingSeconds, setCheckingSeconds] = useState(0);
  const labels = t.home.analysisLabels;
  const sizeToneClass = SIZE_TONE_CLASS[analysis?.sizeTone] || 'text-[#212121]';
  const isLargeRepository = analysis?.size === 'Large';
  const isApiKeyMissing = isLargeRepository && !apiKey.trim();
  const showApiKeyError = currentStep === 2 && isApiKeyMissing;
  const displayName = user?.github?.displayName || user?.name || user?.github?.username;

  useEffect(() => {
    if (!isChecking) {
      setCheckingSeconds(0);
      return undefined;
    }

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setCheckingSeconds(Math.max(1, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isChecking]);

  const handleRepoSubmit = async (event) => {
    event.preventDefault();

    const trimmedRepoUrl = repoUrl.trim();

    if (!trimmedRepoUrl || isChecking) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/' } });
      return;
    }

    if (currentStep === 2) {
      handleAnalyzeSubmit(event);
      return;
    }

    try {
      const nextAnalysis = await checkRepo({
        accessToken,
        repoUrl: trimmedRepoUrl,
      });

      setAnalysis(nextAnalysis);
      setRepoUrl(nextAnalysis.repoUrl || trimmedRepoUrl);
      setApiKey('');
      setCurrentStep(2);
    } catch {
      window.alert(t.home.checkRepoFailed);
    }
  };

  const handleAnalyzeSubmit = (event) => {
    event.preventDefault();

    if (isApiKeyMissing) {
      return;
    }

    navigate('/result', {
      state: {
        analysis,
        repoUrl: analysis?.repoUrl || repoUrl,
        usedPersonalApiKey: Boolean(apiKey.trim()),
      },
    });
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col" data-node-id="642:30588">
      <div
        className="flex h-[76px] shrink-0 basis-[76px] items-center justify-between gap-4 border-b border-[#dddddd] px-5 py-[18px]"
        data-node-id="667:30808"
      >
        <span className="min-w-0 truncate text-[16px] font-medium leading-6 text-[#212121]">{displayName || ''}</span>
        <button
          className="inline-flex h-10 w-fit min-w-[137px] shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-[100px] bg-[linear-gradient(180deg,#4d78fa_0%,#4d5dfa_100%)] px-4 text-[15px] font-light leading-[21px] tracking-[0] text-white shadow-[4px_8px_12px_rgba(77,93,250,0.25)] transition duration-150 hover:brightness-90 active:brightness-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa] [text-shadow:4px_8px_24px_rgba(77,93,250,0.25)]"
          type="button"
          onClick={() => {
            setCurrentStep(1);
            setRepoUrl('');
            setApiKey('');
            setAnalysis(null);
          }}
        >
          <img className="size-5" src={addCircleIcon} alt="" aria-hidden="true" />
          <span className="text-white">{t.home.newChat}</span>
        </button>
      </div>

      <div
        className="flex min-h-[630px] flex-1 items-center justify-center overflow-hidden bg-[rgba(77,93,250,0.02)] p-2.5"
        data-node-id="667:30800"
      >
        <div
          className={`flex w-[min(790px,100%)] flex-col overflow-hidden p-2.5 max-[1120px]:w-[min(760px,100%)] ${currentStep === 1 ? 'h-[380px] gap-[41px]' : 'h-[504px] justify-between'
            }`}
          data-node-id="667:30840"
        >
          <div className="flex w-full items-center justify-between gap-8" data-node-id="667:33124">
            <div className="flex min-w-0 flex-col gap-4">
              <h1 className="m-0 text-[30px] font-medium leading-[24px] tracking-[0] text-[#212121]">{t.home.title}</h1>
              <p className="m-0 bg-[linear-gradient(90deg,#4d5dfa_0%,#4d8cfa_38%,#4da6fa_65%,#4de0fa_100%)] bg-clip-text text-[30px] font-medium leading-[24px] tracking-[0] text-transparent py-2">
                {t.home.subtitle}
              </p>
            </div>
            <span
              className="size-[70px] shrink-0 rounded-full bg-[linear-gradient(180deg,#4d5dfa_0%,#4d90fa_43%,#4da6fa_64%,#4dd2fa_95%,#69dcff_100%)] shadow-[2px_5px_13.5px_3px_rgba(77,135,250,0.25)]"
              aria-hidden="true"
            />
          </div>

          <div className={`flex w-full flex-col items-start justify-between ${currentStep === 1 ? 'h-28' : 'h-[196px]'}`}>
            <div
              className={`inline-flex h-10 max-w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-[50px] border border-dashed border-[#dddddd] px-4 text-[13px] font-normal leading-[24px] text-[#212121] ${currentStep === 1 ? 'w-[469px]' : 'w-[737px]'
                }`}
            >
              <img className="size-[18px]" src={playIcon} alt="" aria-hidden="true" />
              <span>{currentStep === 1 ? t.home.stepOne : t.home.stepTwo}</span>
            </div>

            <div className={`flex w-full flex-col items-start justify-between ${currentStep === 1 ? 'h-[61px]' : 'h-[142px]'}`}>
              <form
                className="flex h-[61px] w-full items-center justify-between overflow-visible rounded-[50px] bg-white px-5 py-2 shadow-[0_0_10px_1px_rgba(77,93,250,0.15)]"
                onSubmit={handleRepoSubmit}
              >
                <label className="flex min-w-0 flex-1 items-center gap-2.5 whitespace-nowrap text-[13px] font-extralight leading-[24px] text-[#8f8f8f]">
                  <span className="sr-only">{t.home.repoPlaceholder}</span>
                  <img className="size-6" src={starsIcon} alt="" aria-hidden="true" />
                  <input
                    className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-extralight leading-[24px] text-[#212121] outline-none placeholder:text-[#8f8f8f]"
                    type="url"
                    value={repoUrl}
                    onChange={(event) => setRepoUrl(event.target.value)}
                    placeholder={t.home.repoPlaceholder}
                    autoComplete="url"
                  />
                </label>
                <button
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#4da1fa_0%,#4d74fa_32.21%,#4d5dfa_100%)] p-0 shadow-[0_0_2.6px_rgba(77,93,250,0.15)] transition duration-150 hover:brightness-90 active:brightness-85 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa]"
                  type="submit"
                  disabled={(currentStep === 2 && isApiKeyMissing) || isChecking}
                  aria-label={currentStep === 1 ? t.home.submitRepo : t.home.analyze}
                >
                  <img
                    className={currentStep === 1 ? 'h-4 w-[15px]' : 'size-6 brightness-0 invert'}
                    src={currentStep === 1 ? sendArrowIcon : starsIcon}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </form>

              {currentStep === 2 && (
                <div className="relative flex h-[81px] w-full flex-col items-start justify-center">
                  {showApiKeyError && (
                    <span className="-mb-1 text-[20px] font-normal leading-[24px] text-[#f75555]" aria-hidden="true">
                      *
                    </span>
                  )}
                  <label
                    className={`flex h-[61px] w-full items-center overflow-hidden rounded-[50px] bg-white px-5 py-2 shadow-[0_0_10px_1px_rgba(77,93,250,0.15)] ${showApiKeyError ? 'border border-[#f75555]' : ''
                      }`}
                  >
                    <span className="sr-only">{t.home.apiKeyPlaceholder}</span>
                    <span className="flex min-w-0 flex-1 items-center gap-1.5">
                      <img className="size-5 shrink-0" src={gptIcon} alt="" aria-hidden="true" />
                      <input
                        className="min-w-0 flex-1 border-0 bg-transparent text-[13px] font-extralight leading-[24px] text-[#212121] outline-none placeholder:text-[#8f8f8f]"
                        type="text"
                        value={apiKey}
                        onChange={(event) => setApiKey(event.target.value)}
                        placeholder={analysis?.apiKey || t.home.apiKeyPlaceholder}
                        autoComplete="off"
                      />
                    </span>
                  </label>
                  {showApiKeyError && (
                    <p className="absolute left-5 top-full mt-1 text-[11px] font-light leading-[14px] text-[#f75555]">
                      {t.home.apiKeyRequired}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {currentStep === 2 && analysis && (
            <div className="flex h-[164px] w-full shrink-0 flex-col items-start justify-between overflow-hidden rounded-[15px] bg-white py-2.5 pl-5 pr-[137px] text-[13px] leading-[24px] text-black shadow-[0_0_4px_1px_rgba(0,0,0,0.05)]">
              <InfoRow label={labels.branch} value={analysis.branch} />
              <InfoRow label={labels.fileCount} value={analysis.fileCount} />
              <InfoRow label={labels.totalBytes} value={analysis.totalBytes} />
              <InfoRow label={labels.size} value={analysis.size} valueClassName={sizeToneClass} />
              <InfoRow label={labels.sizeReason} value={analysis.sizeReason} wide />
              <InfoRow label={labels.advice} value={analysis.advice} wide />
            </div>
          )}
        </div>
      </div>
      {isChecking && <RepoCheckingAlert seconds={checkingSeconds} t={t} />}
    </section>
  );
}

function InfoRow({ label, value, valueClassName = 'text-black', wide = false }) {
  const tooltip = String(value ?? '');

  return (
    <div className={`flex max-w-full items-center gap-2 whitespace-nowrap ${wide ? 'w-full' : ''}`} title={tooltip}>
      <span className="shrink-0 font-normal text-black">{label}:</span>
      <span className={`min-w-0 overflow-hidden text-ellipsis font-light ${valueClassName}`}>{value}</span>
    </div>
  );
}

function RepoCheckingAlert({ seconds, t }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4" role="alert" aria-live="polite">
      <div className="w-full max-w-[420px] rounded-[15px] bg-white px-6 py-5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
        <p className="m-0 text-[18px] font-medium leading-6 text-[#212121]">{t.home.checkingRepo}</p>
        <p className="m-0 mt-3 text-[14px] font-light leading-[22px] text-[#8f8f8f]">{t.home.checkingRepoWait}</p>
        <p className="m-0 mt-4 text-[16px] font-medium leading-6 text-[#4d5dfa]">
          {seconds} {t.home.checkingRepoSeconds}
        </p>
      </div>
    </div>
  );
}
