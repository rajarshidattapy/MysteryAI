import { supabase } from "./supabaseClient";

export const isCaseTooSimilar = async (embedding, threshold = 0.9) => {
  const { data, error } = await supabase
    .from("case_embeddings")
    .select("embedding");
  if (error) {
    console.error("Error fetching case embeddings:", error);
    return false;
  }
  for (const existing of data) {
    const similarity = cosineSimilarity(existing.embedding, embedding);
    if (similarity > threshold) {
      console.log("⚠️ Similar case found. Similarity:", similarity);
      return true;
    }
  }
  return false;
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
