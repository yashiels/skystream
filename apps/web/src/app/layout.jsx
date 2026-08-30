import { Inter } from 'next/font/google';
import Script from 'next/script';
import ClientLayout from '../components/Layout';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'SkyStream | Watch Free Movies & TV Shows Online - No Sign Up',
  description:
    'Discover and stream a vast collection of free movies and TV shows online in HD, Full HD and 4K on SkyStream. No sign-up required. Your ultimate destination for entertainment.',
  keywords:
    'free movies,free tv shows,stream online,hd streaming,no sign up movies,skystream,watch movies online,watch tv shows online,4K movies,full HD,streaming site',
  robots: 'index, follow',
  referrer: 'origin',
  metadataBase: new URL('https://www.sky-stream.online'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.sky-stream.online/',
    title: 'SkyStream | Free Movies & TV Shows Online - No Sign Up',
    description:
      'Watch thousands of movies and TV shows in HD, Full HD and 4K. No sign-up required.',
    siteName: 'SkyStream',
    images: [
      {
        url: 'https://www.sky-stream.online/LOGO.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SkyStream',
    title: 'SkyStream | Free Movies & TV Shows - No Sign Up',
    description: 'Stream free movies and TV shows in HD, Full HD and 4K. No registration needed.',
    images: ['https://www.sky-stream.online/LOGO.png'],
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }, { url: '/favicon.ico' }],
    apple: [{ url: '/favicon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#0a0a0f',
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Structured Data: WebSite + SearchAction */}
        {/* STATIC ONLY — never interpolate dynamic/user data here; use metadata.other instead */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'SkyStream',
              url: 'https://www.sky-stream.online',
              description:
                'Watch free movies and TV shows online in HD, Full HD and 4K. No sign-up required.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.sky-stream.online/?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* Structured Data: Organization */}
        {/* STATIC ONLY — never interpolate dynamic/user data here; use metadata.other instead */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'SkyStream',
              url: 'https://www.sky-stream.online',
              logo: 'https://www.sky-stream.online/LOGO.png',
              founder: [
                {
                  '@type': 'Person',
                  name: 'Yashiel Sookdeo',
                  url: 'https://github.com/yashiels',
                },
                {
                  '@type': 'Person',
                  name: 'Mpho Ndlela',
                  url: 'https://github.com/MphoCodes',
                },
              ],
              sameAs: [
                'https://github.com/skynergroup',
                'https://github.com/yashiels',
                'https://github.com/MphoCodes',
              ],
            }),
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>

        {/* Google tag (gtag.js) with Consent Mode */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CR3ZVV9BE1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              functionality_storage: 'granted',
              security_storage: 'granted',
            });

            gtag('config', 'G-CR3ZVV9BE1', {
              anonymize_ip: true,
              respect_dnt: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
            });
          `}
        </Script>

        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.warn('SW registration failed:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
