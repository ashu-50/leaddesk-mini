export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
}

/** What the login route handler returns — deliberately without the token. */
export interface LoginResult {
  admin: AdminProfile;
}
