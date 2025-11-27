// src/RAG/storeOverviewEmbedding.js
import { supabase } from "../src/supabaseClient";

export const storeOverviewEmbedding = async (caseId, summary, embedding) => {
  try {
    // Storing in 'cases' table or a separate 'case_overviews' table
    // Since we didn't create a 'case_overviews' table in the migration, 
    // we might want to update the 'cases' table if it has an embedding column,
    // OR create a new table. 
    // For now, let's assume we use the 'embeddings' table with a special role 'overview'
    // OR just log it if we don't have a place.

    // Actually, let's try to update the case itself if it exists
    if (caseId) {
      const { error } = await supabase
        .from('cases')
        .update({
          embedding: embedding
        })
        .eq('id', caseId);

      if (error) throw error;
      console.log("📌 Overview embedding stored in case:", caseId);
    }

  } catch (err) {
    console.error("❌ Failed to store overview embedding:", err);
  }
};
