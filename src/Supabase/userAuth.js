// src/Supabase/userAuth.js
import { 
  registerUser,
  loginUser,
  logoutUser,
  onAuthStateChange,
  getUserProfile,
  supabase
} from './auth'

// Export everything needed for backward compatibility
export { 
  registerUser,
  loginUser,
  logoutUser,
  onAuthStateChange,
  supabase as auth,
  supabase,
  getUserProfile
}