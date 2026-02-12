import { supabase } from './supabaseClient'

// Register new user
export const registerUser = async (email, password, username) => {
  // Guard: Return error if Supabase is not configured
  if (!supabase) {
    console.warn("⚠️ Supabase not configured - auth features disabled")
    return {
      user: null,
      error: "Authentication not available - Supabase not configured"
    }
  }

  try {
    // Validate password length
    if (password.length < 6) {
      return { 
        user: null, 
        error: "Password should be at least 6 characters" 
      }
    }
    
    // Sign up user with email and password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    })
    
    if (error) {
      return { user: null, error: error.message }
    }
    
    // Update user metadata with username
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: {
        username: username
      }
    })
    
    if (updateError) {
      console.warn("Failed to update user metadata:", updateError)
    }
    
    return { user: data.user, error: null }
  } catch (error) {
    console.error("Registration error:", error)
    return { user: null, error: error.message }
  }
}

// Sign in existing user
export const loginUser = async (email, password) => {
  // Guard: Return error if Supabase is not configured
  if (!supabase) {
    console.warn("⚠️ Supabase not configured - auth features disabled")
    return {
      user: null,
      error: "Authentication not available - Supabase not configured"
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return { user: null, error: error.message }
    }
    
    return { user: data.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

// Sign out user
export const logoutUser = async () => {
  // Guard: Return success if Supabase is not configured (nothing to log out from)
  if (!supabase) {
    console.warn("⚠️ Supabase not configured - auth features disabled")
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Get user profile
export const getUserProfile = async (userId) => {
  // Guard: Return null if Supabase is not configured
  if (!supabase) {
    console.warn("⚠️ Supabase not configured - profile features disabled")
    return { profile: null, error: "Profile not available - Supabase not configured" }
  }

  try {
    const { data, error } = await supabase
      .from('user_details')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      return { profile: null, error: error.message }
    }
    
    return { profile: data, error: null }
  } catch (error) {
    return { profile: null, error: error.message }
  }
}

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
  // Guard: Return no-op function if Supabase is not configured
  if (!supabase) {
    console.warn("⚠️ Supabase not configured - auth state listener disabled")
    // Return a no-op unsubscribe function
    return { data: { subscription: { unsubscribe: () => {} } } }
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}

// Export auth instance for direct access
export { supabase }