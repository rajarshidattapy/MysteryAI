import { supabase } from "./supabaseClient";

// Store embeddings for a case
export const storeEmbeddingsForCase = async (caseId, embeddings) => {
  if (!Array.isArray(embeddings)) return;
  for (const embedding of embeddings) {
    const { error } = await supabase
      .from('embeddings')
      .insert({ caseId, ...embedding });
    if (error) {
      console.error('Error saving embedding:', error);
    }
  }
  console.log('✅ Embeddings saved for case:', caseId);
};
