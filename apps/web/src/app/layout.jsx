import { Inter } from 'next/font/google';
import ClientLayout from '../components/Layout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'SkyLog | AI Fleet Operations for South African Logistics',
  description:
    'SkyLog connects CarTrack, Ctrack, Netstar, Tracker, MiX and other fleet systems. Turn raw tracking data into live operations, exceptions, trip history, and billing-ready intelligence.',
  keywords:
    'fleet management,fleet operations,CarTrack,Ctrack,Netstar,Tracker,MiX,South Africa,logistics,AI fleet,vehicle tracking,operations software,fleet intelligence',
  robots: 'index, follow',
  referrer: 'origin',
  metadataBase: new URL('https://skylog.co.za'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://skylog.co.za/',
    title: 'SkyLog | AI Fleet Operations for South African Logistics',
    description:
      'Connect your fleet trackers. SkyLog turns movement into live operations, exceptions, trip history, and billing-ready intelligence.',
    siteName: 'SkyLog',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@skylog_ai',
    title: 'SkyLog | AI Fleet Operations for SA Logistics',
    description:
      'Connect CarTrack, Ctrack, Netstar, Tracker, MiX and more. AI operations layer for South African logistics operators.',
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }, { url: '/favicon.ico' }],
    apple: [{ url: '/favicon.png', sizes: '180x180' }],
  },
  other: {
    'theme-color': '#0a0a1a',
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
