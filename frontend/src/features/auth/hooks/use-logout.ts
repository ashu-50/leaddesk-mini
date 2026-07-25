'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Signing out succeeds locally even if the API call did not: the cookie
      // is cleared by the route handler either way.
      queryClient.clear();
      router.replace('/admin/login');
      router.refresh();
    },
    onSuccess: () => toast.success('Signed out'),
  });
}
