'use client';

import Link from 'next/link';
import { ChevronDownIcon, ExternalLinkIcon, LogOutIcon } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { formatInitials } from '@/lib/format';
import type { AdminProfile } from '@/types/auth';

export function AdminHeader({ admin }: { admin: AdminProfile }) {
  const logout = useLogout();

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <Logo href="/admin" />
          <Badge variant="secondary" className="hidden font-mono text-[0.625rem] sm:inline-flex">
            ADMIN
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <span
                  aria-hidden
                  className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-full font-mono text-[0.625rem] font-semibold"
                >
                  {formatInitials(admin.email)}
                </span>
                <span className="hidden max-w-[14ch] truncate sm:inline">{admin.email}</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="truncate text-sm">{admin.email}</span>
                <span className="text-muted-foreground font-mono text-[0.625rem] tracking-wide">
                  {admin.role}
                </span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <ExternalLinkIcon />
                    View the website
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  disabled={logout.isPending}
                  onSelect={(event) => {
                    event.preventDefault();
                    logout.mutate();
                  }}
                >
                  {logout.isPending ? <Spinner /> : <LogOutIcon />}
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
