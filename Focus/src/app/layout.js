import { Inter } from 'next/font/google';
import './globals.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Focus',
  description: 'Your personalized writing and research command center.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a78bfa" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
