import { supabase } from "./supabaseClient";

export const getRelevantContext = async (caseId, inputEmbedding) => {
  const { data, error } = await supabase
    .from("embeddings")
    .select("*")
    .eq("caseId", caseId);
  if (error) {
    console.error("Error fetching embeddings:", error);
    return null;
  }

  let bestMatch = null;
  let bestScore = -1;
  for (const item of data) {
    const score = cosineSimilarity(item.embedding, inputEmbedding);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item.text;
    }
  }
  return bestMatch;
};

// Dummy cosineSimilarity for placeholder
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
