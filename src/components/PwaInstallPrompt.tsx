import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';

export function PwaInstallPrompt() {
  const prompt = usePwaInstallPrompt();

  if (!prompt.isVisible) return null;

  const isNativeInstall = prompt.mode === 'native';

  return (
    <aside className="install-prompt" aria-live="polite" aria-label="Installation de l'application">
      <div>
        <p className="install-prompt__eyebrow">PWA disponible</p>
        <h2>Installer TCM 2026</h2>
        {isNativeInstall ? (
          <p>Ajoute l'application sur ton ecran d'accueil pour y acceder plus vite, meme en plein terrain.</p>
        ) : (
          <p>
            Sur iPhone, appuie sur le bouton Partager de Safari, puis choisis Ajouter a l'ecran d'accueil.
          </p>
        )}
      </div>
      <div className="install-prompt__actions">
        {isNativeInstall ? (
          <button className="install-prompt__primary" type="button" onClick={prompt.install}>
            Installer
          </button>
        ) : null}
        <button className="install-prompt__secondary" type="button" onClick={prompt.dismiss}>
          {isNativeInstall ? 'Plus tard' : "J'ai compris"}
        </button>
      </div>
    </aside>
  );
}
