import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

import { Toaster } from '@/components/ui/sonner';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: 'Smart City Dashboard',
  description: 'Operations and Asset Management Dashboard',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader color="#2563eb" showSpinner={false} />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
