import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AnimeTracker - Track Your Favorite Anime Episodes',
  description: 'Stay up to date with your favorite anime series. Track episodes, get notifications, and discover new anime with our comprehensive tracking platform.',
  keywords: 'anime, tracker, episodes, watch list, anime news, manga, otaku',
  authors: [{ name: 'AnimeTracker Team' }],
  openGraph: {
    title: 'AnimeTracker - Track Your Favorite Anime Episodes',
    description: 'Stay up to date with your favorite anime series. Track episodes, get notifications, and discover new anime.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnimeTracker',
    description: 'Track your favorite anime episodes and stay updated',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
