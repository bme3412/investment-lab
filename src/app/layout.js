// src/app/layout.js

import MainNav from '@/components/MainNav';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainNav />
        <main className="pl-64"> {/* Add padding to account for fixed sidebar width */}
          {children}
        </main>
      </body>
    </html>
  );
}

export const metadata = {
  title: 'Investment Lab',
  description: 'Tech sector analysis platform',
};