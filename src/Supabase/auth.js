import { supabase } from './supabaseClient'

// Register new user
export const registerUser = async (email, password, username) => {
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
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}

// Export auth instance for direct access
export { supabase }