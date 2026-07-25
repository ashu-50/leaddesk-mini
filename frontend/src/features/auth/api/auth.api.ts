import { apiClient } from '@/lib/api-client';
import type { LoginResult } from '@/types/auth';
import type { LoginInput } from '../schemas/login.schema';

/**
 * These endpoints are this app's own route handlers, not the NestJS API.
 * They set and clear the httpOnly session cookie, so the token never appears
 * in a response the browser can read.
 */
export const authApi = {
  login(input: LoginInput): Promise<LoginResult> {
    return apiClient<LoginResult>('/api/auth/login', { method: 'POST', body: input });
  },

  logout(): Promise<null> {
    return apiClient<null>('/api/auth/logout', { method: 'POST' });
  },
};
