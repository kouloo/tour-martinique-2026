import type { PropsWithChildren } from 'react';

export function MobileShell({ children }: PropsWithChildren) {
  return <main className="mobile-shell">{children}</main>;
}
