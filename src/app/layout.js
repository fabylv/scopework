import { GeistSans } from 'geist/font/sans';
import './globals.css';


export const metadata = {
  title: 'ScopeWork',
  description: 'AI-powered property repair estimator',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ScopeWork',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#FFA12B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <head>
        {/* Apple PWA icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Safari pinned tab color */}
        <meta name="msapplication-TileColor" content="#2563eb" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
