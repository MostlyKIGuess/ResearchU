import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'ResearchU - AI Research Assistant',
  description: 'AI-powered platform for automating scientific research',
  icons: {
    icon: '/researchu.jpg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <link rel="icon" href="/researchu.jpg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
