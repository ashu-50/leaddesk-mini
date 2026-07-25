import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/layout/admin-header';
import { callApi } from '@/lib/server/api';
import type { AdminProfile } from '@/types/auth';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

// The session is read per request; nothing in the admin area may be cached.
export const dynamic = 'force-dynamic';

/**
 * The real authentication boundary for the admin area.
 *
 * The middleware only checks that a cookie exists. Here the token is actually
 * verified — signature, expiry and the admin still existing in the database —
 * before a single protected pixel is rendered.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const result = await callApi<AdminProfile>('/auth/me', { authenticated: true });

  if (!result.payload.success) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AdminHeader admin={result.payload.data} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
