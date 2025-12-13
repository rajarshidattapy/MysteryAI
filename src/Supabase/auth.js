// Supabase authentication utilities
import { supabase } from "./supabaseClient";

// Register a new user
export const registerUser = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });
  return { user: data?.user, error };
};

// Login user
export const loginUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data?.user, error };
};

// Logout user
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Alias for compatibility with imports expecting 'signOut'
export const signOut = logoutUser;

// Get current user
export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => data.subscription.unsubscribe();
};
