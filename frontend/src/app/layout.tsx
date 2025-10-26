import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocScanner.ai - AI 계약서 분석 플랫폼",
  description: "사회초년생과 프리랜서를 위한 AI 기반 계약서 분석 및 협상 전략 제안 서비스",
  keywords: "계약서 분석, AI, 법률, 리스크 분석, 협상 전략",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
