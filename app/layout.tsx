import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Location App - Farcaster Mini App',
  description: '实时定位和拍照应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

