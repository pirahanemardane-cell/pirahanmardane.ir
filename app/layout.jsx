import './globals.css';

const SITE_URL = 'https://pirahanemardane.ir';
const SITE_NAME = 'پیراهن مردانه';
const SITE_DESC =
  'فروشگاه اینترنتی پیراهن مردانه — رسمی، کروات، لینن و آستین کوتاه از فروشندگان معتبر';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | PIRAHANMARDANE.IR`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | PIRAHANMARDANE.IR`,
    description: SITE_DESC,
    images: [{ url: '/logo.webp', width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | PIRAHANMARDANE.IR`,
    description: SITE_DESC,
    images: ['/logo.webp'],
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-image-preview': 'none',
      'max-snippet': 0,
      'max-video-preview': 0,
    },
  },
  other: {
    'theme-color': '#1d1d1f',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.webp', sizes: '32x32', type: 'image/webp' },
    ],
    apple: [{ url: '/apple-touch-icon.webp' }],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1d1d1f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
<meta name="fontiran.com:license" content="E0QI1G9U" />
        {/* Performance: preconnect; fonts non-blocking for PageSpeed mobile */}

<script
          dangerouslySetInnerHTML={{
            __html: `(function(){function a(){document.querySelectorAll('link[media=print][rel=stylesheet]').forEach(function(l){l.media='all'});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',a);else a();})();`,
          }}
        />
        <noscript>
</noscript>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preload" as="image" href="/hero-poster.webp" fetchPriority="high" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="پیراهن مردانه" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',!!dark);}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
