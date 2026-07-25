import Link from 'next/link';
import { Logo } from '@/components/layout/logo';

const FOOTER_LINKS = [
  { href: '#pipeline', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#enquiry', label: 'Send an enquiry' },
  { href: '/admin', label: 'Admin sign in' },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="flex max-w-xs flex-col gap-3">
            <Logo />
            <p className="text-muted-foreground text-sm">
              A small lead desk: one form on your site, one table for your team, three states in
              between.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <p className="eyebrow">Pages</p>
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground w-fit text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="text-muted-foreground flex flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs tracking-wide">
            Built for{' '}
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:no-underline"
            >
              Digital Heroes Training Task
            </a>
          </p>
          <p className="text-xs">© {new Date().getFullYear()} LeadDesk Mini</p>
        </div>
      </div>
    </footer>
  );
}
