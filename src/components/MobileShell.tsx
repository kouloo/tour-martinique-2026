import type { PropsWithChildren } from 'react';
import { PwaInstallPrompt } from './PwaInstallPrompt';

export function MobileShell({ children }: PropsWithChildren) {
  return (
    <main className="mobile-shell">
      {children}
      <PwaInstallPrompt />
    </main>
  );
}
