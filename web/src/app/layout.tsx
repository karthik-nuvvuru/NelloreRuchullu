import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NelloreRuchullu - Authentic Nellore Cuisine',
    template: '%s | NelloreRuchullu',
  },
  description: 'Order authentic Nellore-style Andhra cuisine delivered to your door. Taste the tradition.',
  keywords: ['Nellore', 'food', 'Andhra cuisine', 'South Indian', 'delivery', 'restaurant'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ErrorBoundary>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
