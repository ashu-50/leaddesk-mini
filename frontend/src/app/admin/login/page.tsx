import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the LeadDesk Mini admin dashboard.',
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  // Only same-site paths are accepted, so `?next=` cannot be used to bounce
  // someone to another origin after they sign in.
  const redirectTo = next?.startsWith('/admin') ? next : '/admin';

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div aria-hidden className="surface-grid pointer-events-none absolute inset-0 -z-10" />

      <header className="flex items-center justify-between gap-4 px-6 py-5">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="animate-settle flex w-full max-w-sm flex-col gap-6">
          <Card>
            <CardHeader>
              <p className="eyebrow">Admin access</p>
              <CardTitle className="mt-2 text-2xl">Sign in to the desk</CardTitle>
              <CardDescription>
                Only administrators can see captured leads. Sessions last 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm redirectTo={redirectTo} />
            </CardContent>
          </Card>

          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mx-auto flex w-fit items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeftIcon className="size-3.5" />
            Back to the website
          </Link>
        </div>
      </main>
    </div>
  );
}
