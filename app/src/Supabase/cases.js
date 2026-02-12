import { supabase } from './supabaseClient'

// Store case in database
export const storeCaseInSupabase = async (caseData, userId) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .insert([
        {
          ...caseData,
          created_by: userId,
          embedding: null // Optional, for RAG
        }
      ])
      .select()
    
    if (error) {
      console.error("Error adding case to Supabase:", error)
      throw error
    }
    
    console.log("Case stored with ID:", data[0].id)
    return data[0].id
  } catch (err) {
    console.error("Error adding case to Supabase:", err)
    throw err
  }
}

// Update case chat
export const updateCaseChat = async (caseId, updatedChatData) => {
  try {
    const { error } = await supabase
      .from('cases')
      .update({
        suspects: updatedChatData.suspects,
        witnesses: updatedChatData.witnesses
      })
      .eq('id', caseId)
    
    if (error) {
      console.error("Error updating chat in Supabase:", error)
      return
    }
    
    console.log("Case chat updated successfully")
  } catch (err) {
    console.error("Error updating chat in Supabase:", err)
  }
}

// Update case with guess
export const updateCaseWithGuess = async (caseId, { user_guess, guess_correct }) => {
  try {
    const { error } = await supabase
      .from('cases')
      .update({
        user_guess,
        guess_correct,
        updated_at: new Date()
      })
      .eq('id', caseId)
    
    if (error) {
      console.error("Error storing guess in Supabase:", error)
      return
    }
    
    console.log("Guess stored successfully")
  } catch (error) {
    console.error("Error storing guess in Supabase:", error)
  }
}

// Get user games for leaderboard
export const getUserGames = async () => {
  try {
    const { data, error } = await supabase
      .from('user_games')
      .select('*')
      .eq('solved', true)
    
    if (error) {
      console.error("Error fetching user games:", error)
      return []
    }
    
    return data
  } catch (error) {
    console.error("Error fetching user games:", error)
    return []
  }
}