import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "구독관리",
  description: "여러 구독 서비스의 결제일과 지출을 한눈에 관리하세요",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* 하이드레이션 전에 동기적으로 실행돼, 저장된 다크모드 설정을 첫 페인트부터 반영한다
            (깜빡임 방지). "sm_theme" 키는 storage.ts의 THEME_KEY와 반드시 같아야 한다. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(localStorage.getItem('sm_theme')==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <main className="flex-1 w-full max-w-md mx-auto px-4 pb-24 pt-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
