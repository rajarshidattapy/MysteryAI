import { supabase } from '../supabaseClient';

export const storeCaseInSupabase = async (caseData, userId) => {
    try {
        const { data, error } = await supabase
            .from('cases')
            .insert([
                {
                    ...caseData,
                    created_by: userId,
                    created_at: new Date(),
                    embedding: null // Embeddings stored separately or in this column if JSONB
                }
            ])
            .select()
            .single();

        if (error) throw error;
        console.log("Case stored with ID:", data.id);
        return data.id;
    } catch (err) {
        console.error("Error adding case to Supabase:", err);
        throw err;
    }
};

export const updateCaseChat = async (caseId, updatedChatData) => {
    try {
        const { error } = await supabase
            .from('cases')
            .update({
                suspects: updatedChatData.suspects,
                witnesses: updatedChatData.witnesses
            })
            .eq('id', caseId);

        if (error) throw error;
    } catch (err) {
        console.error("Error updating chat in Supabase:", err);
    }
};

export const updateCaseWithGuess = async (caseId, { user_guess, guess_correct }) => {
    try {
        const { error } = await supabase
            .from('cases')
            .update({
                user_guess,
                guess_correct,
                solved_at: new Date()
            })
            .eq('id', caseId);

        if (error) throw error;
        console.log("✅ Guess stored.");
    } catch (error) {
        console.error("❌ Error storing guess:", error);
    }
};
