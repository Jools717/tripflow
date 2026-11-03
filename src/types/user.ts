export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  username?: string;
  role?: 'admin' | 'user';
  avatarUrl?: string;
  createdAt?: string;
}

export const ADMIN_JOOLS_USER: UserProfile = {
  id: 'user-admin-jools',
  email: 'adminjools@tripflow.app',
  displayName: 'AdminJools',
  username: 'AdminJools',
  role: 'admin',
  avatarUrl: '',
  createdAt: '2026-11-02T00:00:00.000Z'
};
