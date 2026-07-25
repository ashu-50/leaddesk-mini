import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '#pipeline', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#customers', label: 'Customers' },
];

export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/admin">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="#enquiry">
              Send an enquiry
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
