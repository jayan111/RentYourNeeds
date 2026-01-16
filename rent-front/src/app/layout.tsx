import type { Metadata } from 'next';
import { Josefin_Sans } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Providers } from '@/components/providers/Providers';

const josefinSans = Josefin_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-josefin'
});

export const metadata: Metadata = {
  title: 'RentYourNeeds - Premium Rental Marketplace',
  description: 'Rent premium products at affordable prices. From electronics to photography equipment, find everything you need.',
  keywords: 'rental, marketplace, electronics, photography, equipment, rent, India',
  authors: [{ name: 'RentYourNeeds Team' }],
  creator: 'RentYourNeeds',
  publisher: 'RentYourNeeds',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://rentyourneeds.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RentYourNeeds - Premium Rental Marketplace',
    description: 'Rent premium products at affordable prices. From electronics to photography equipment, find everything you need.',
    url: 'https://rentyourneeds.com',
    siteName: 'RentYourNeeds',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RentYourNeeds - Premium Rental Marketplace',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentYourNeeds - Premium Rental Marketplace',
    description: 'Rent premium products at affordable prices. From electronics to photography equipment, find everything you need.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3b82f6' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={josefinSans.variable}>
      <body className={`${josefinSans.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}