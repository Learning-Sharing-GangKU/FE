import Providers from "@/components/Providers" 
import { Toaster } from "@/components/Toaster"
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'GangKU',
  description: '강쿠 프로젝트',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const initialIsLoggedIn = !!token;

  return (
    <html lang="ko">
      <body>
        <Providers initialIsLoggedIn={initialIsLoggedIn}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}