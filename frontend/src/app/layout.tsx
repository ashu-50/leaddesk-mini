import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// A grotesque with real width variation — used only for headings, so the page
// has a voice without becoming a typeface demo.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

// Reserved for labels, counts and timestamps: anything a reader scans rather
// than reads.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'LeadDesk Mini — every enquiry lands on one desk',
    template: '%s · LeadDesk Mini',
  },
  description:
    'Capture enquiries from your website, sort them into three lanes, and see at a glance which ones are still waiting on a reply.',
  keywords: ['lead management', 'CRM', 'enquiry form', 'small studio', 'sales pipeline'],
  openGraph: {
    title: 'LeadDesk Mini — every enquiry lands on one desk',
    description:
      'Capture enquiries from your website, sort them into three lanes, and see which ones are still waiting on a reply.',
    type: 'website',
    siteName: 'LeadDesk Mini',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1d24' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // next-themes writes the class before paint; without this React warns
      // about the server/client mismatch it deliberately introduces.
      suppressHydrationWarning
      className={`${inter.variable} ${bricolage.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
