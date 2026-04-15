import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Odds Premium Dashboard',
  description: 'Painel visual para o backend Odds Premium Engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
