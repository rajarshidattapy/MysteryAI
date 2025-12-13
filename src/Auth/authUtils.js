import { getCurrentUser, signOut } from '../Supabase/auth.js';

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export const logout = async (navigate) => {
  await signOut();
  navigate('/auth');
};

export const getUsername = async () => {
  const user = await getCurrentUser();
  return user ? user.user_metadata?.username || user.email : null;
};
