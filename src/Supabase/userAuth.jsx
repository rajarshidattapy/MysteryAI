import { supabase } from '../supabaseClient';

// Register new user
export const registerUser = async (email, password, username) => {
    try {
        // Validate password length
        if (password.length < 6) {
            return {
                user: null,
                error: "Password should be at least 6 characters"
            };
        }

        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: username,
                    username: username
                }
            }
        });

        if (error) throw error;

        // Create user entry in 'users' table
        if (data.user) {
            const { error: dbError } = await supabase
                .from('users')
                .insert([
                    {
                        id: data.user.id,
                        username: username,
                        email: email,
                        created_at: new Date(),
                        stats: {
                            gamesPlayed: 0,
                            wins: 0,
                            totalSolveTime: 0
                        }
                    }
                ]);

            if (dbError) {
                console.error("Error creating user profile:", dbError);
                // Note: Auth user is still created, might want to handle this edge case
            }
        }

        return { user: data.user, error: null };
    } catch (error) {
        console.error("Registration error:", error.message);
        return { user: null, error: error.message };
    }
};

// Sign in existing user
export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

// Sign out user
export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

// Get user profile
export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { profile: data, error: null };
    } catch (error) {
        return { profile: null, error: error.message };
    }
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user || null);
    });

    // Return unsubscribe function
    return () => subscription.unsubscribe();
};

// Helper to get current user
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};
