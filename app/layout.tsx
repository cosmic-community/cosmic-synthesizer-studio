import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Cosmic Synthesizer Studio',
  description: 'Professional web-based synthesizer and music production platform with recording capabilities, effects processing, and social sharing.',
  keywords: ['synthesizer', 'music production', 'web audio', 'DAW', 'recording', 'electronic music'],
  authors: [{ name: 'Cosmic Synthesizer Studio' }],
  openGraph: {
    title: 'Cosmic Synthesizer Studio',
    description: 'Create professional music with our web-based synthesizer platform',
    type: 'website',
    images: [{
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop&auto=format',
      width: 1200,
      height: 630,
      alt: 'Cosmic Synthesizer Studio'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic Synthesizer Studio',
    description: 'Create professional music with our web-based synthesizer platform',
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop&auto=format']
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00ff88',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#00ff88" />
      </head>
      <body className={`${inter.className} bg-synth-bg text-white min-h-screen`}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-synth-panel border-t border-gray-800 py-6">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-400 mb-4">
                Professional music production powered by Web Audio API
              </p>
              <a
                href={`https://www.cosmicjs.com?utm_source=bucket_${process.env.COSMIC_BUCKET_SLUG}&utm_medium=referral&utm_campaign=app_footer&utm_content=built_with_cosmic`}
                target="_blank"
                rel="noopener noreferrer"
                className="cosmic-button"
              >
                <img 
                  src="https://cdn.cosmicjs.com/b67de7d0-c810-11ed-b01d-23d7b265c299-logo508x500.svg" 
                  alt="Cosmic Logo" 
                  style={{
                    width: '20px',
                    height: '20px',
                  }}
                />
                Built with Cosmic
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}