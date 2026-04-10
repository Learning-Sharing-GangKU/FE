import Providers from "@/components/Providers"
import { Toaster } from "@/components/Toaster"
import { Noto_Sans_KR } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  preload: false,
});

export const metadata: Metadata = {
  title: 'GangKU',
  description: '강쿠 프로젝트',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.className}>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}