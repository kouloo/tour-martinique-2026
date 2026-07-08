import { useEffect, useMemo, useState } from 'react';

const DISMISSED_KEY = 'tcm-pwa-install-dismissed-at';
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type BeforeInstallPromptOutcome = 'accepted' | 'dismissed';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: BeforeInstallPromptOutcome; platform: string }>;
  prompt: () => Promise<void>;
}

type InstallPromptMode = 'native' | 'ios';

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function hasDismissedRecently() {
  const dismissedAt = Number(window.localStorage.getItem(DISMISSED_KEY));
  return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_DURATION_MS;
}

function isIosSafariLike() {
  const userAgent = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent) || (userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
  const isWebKit = /Safari/.test(userAgent);
  const isChromiumIos = /CriOS|FxiOS|EdgiOS/.test(userAgent);
  return isIos && isWebKit && !isChromiumIos;
}

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mode: InstallPromptMode | null = useMemo(() => {
    if (deferredPrompt) return 'native';
    if (showIosHelp) return 'ios';
    return null;
  }, [deferredPrompt, showIosHelp]);

  useEffect(() => {
    if (isStandaloneDisplay() || hasDismissedRecently()) return;

    const timeoutId = window.setTimeout(() => {
      if (isIosSafariLike()) {
        setShowIosHelp(true);
        setIsVisible(true);
      }
    }, 1600);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.clearTimeout(timeoutId);
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowIosHelp(false);
      setIsVisible(false);
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  }

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setDeferredPrompt(null);
    setShowIosHelp(false);
    setIsVisible(false);
  }

  return {
    dismiss,
    install,
    isVisible: isVisible && mode !== null,
    mode
  };
}
