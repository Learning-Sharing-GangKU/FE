import Providers from "@/components/Providers" 
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GangKU',
  description: '강쿠 프로젝트',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}