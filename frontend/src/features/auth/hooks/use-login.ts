'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import type { LoginInput } from '../schemas/login.schema';

export function useLogin(redirectTo: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: () => {
      // Nothing from a previous session should survive a new sign-in.
      queryClient.clear();
      router.replace(redirectTo);
      // Re-runs the server components so the layout picks up the new cookie.
      router.refresh();
    },
  });
}
