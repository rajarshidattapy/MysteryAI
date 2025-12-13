/**
 * Update the chat field for a case
 */
export const updateCaseChat = async (caseId, updatedChatData) => {
  const { error } = await supabase
    .from('cases')
    .update({ chat: updatedChatData })
    .eq('id', caseId);
  if (error) throw error;
};
/**
 * Update a case with a guess or other payload
 */
export const updateCaseWithGuess = async (caseId, payload) => {
  const { error } = await supabase
    .from('cases')
    .update(payload)
    .eq('id', caseId);
  if (error) throw error;
};
import { supabase } from "./supabaseClient";

/**
 * Store a newly generated case
 */
export const storeCase = async (caseData, userId) => {
  const { data, error } = await supabase
    .from("cases")
    .insert({
      ...caseData,
      created_by: userId,
      embedding: null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error storing case:", error);
    throw error;
  }

  return data.id;
};

/**
 * Update user stats after a game
 */
export const updateUserStats = async (userId, isWin, timeTaken) => {
  // Fetch existing stats
  const { data: user, error } = await supabase
    .from("users")
    .select("stats")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const stats = user.stats || {
    gamesPlayed: 0,
    wins: 0,
    totalSolveTime: 0,
  };

  const updatedStats = {
    gamesPlayed: stats.gamesPlayed + 1,
    wins: stats.wins + (isWin ? 1 : 0),
    totalSolveTime: stats.totalSolveTime + (timeTaken || 0),
  };

  const { error: updateError } = await supabase
    .from("users")
    .update({ stats: updatedStats })
    .eq("id", userId);

  if (updateError) throw updateError;
};
