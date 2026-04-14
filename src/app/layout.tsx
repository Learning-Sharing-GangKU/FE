import Providers from "@/components/Providers"
import { Toaster } from "@/components/Toaster"
import { Noto_Sans_KR } from 'next/font/google';
import type { Metadata } from 'next';

import { cookies } from 'next/headers';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'GangKU',
  description: '강쿠 프로젝트',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const initialIsLoggedIn = !!token;

  return (
    <html lang="ko" className={notoSansKr.className}>
      <body>
        <Providers initialIsLoggedIn={initialIsLoggedIn}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
