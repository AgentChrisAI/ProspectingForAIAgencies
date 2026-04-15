import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sunburnt Sales App',
  description: 'Prospect analysis and solution recommendation workspace for Sunburnt AI sales reps.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
