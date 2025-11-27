import { supabase } from "../src/supabaseClient";
import { cosineSimilarity } from "../RAG/cosineUtils";

export const isCaseTooSimilar = async (embedding, threshold = 0.9) => {
  try {
    // Fetch all cases with embeddings
    const { data: cases, error } = await supabase
      .from('cases')
      .select('embedding')
      .not('embedding', 'is', null);

    if (error) throw error;

    for (const doc of cases) {
      // Parse embedding if it's a string
      const existingEmbedding = typeof doc.embedding === 'string'
        ? JSON.parse(doc.embedding)
        : doc.embedding;

      if (!existingEmbedding) continue;

      const similarity = cosineSimilarity(existingEmbedding, embedding);
      if (similarity > threshold) {
        console.log("⚠️ Similar case found. Similarity:", similarity);
        return true;
      }
    }
  } catch (error) {
    console.error("Error checking case similarity:", error);
  }
  return false;
};
