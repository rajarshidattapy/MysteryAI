import { supabase } from "./supabaseClient";

export const queryRelevantEmbeddings = async (userQuestionEmbedding, caseId, topK = 3) => {
  // userQuestionEmbedding should be an array (embedding vector)
  const { data, error } = await supabase
    .from("embeddings")
    .select("*")
    .eq("caseId", caseId);
  if (error) {
    console.error("Error fetching embeddings:", error);
    return [];
  }

  // You must implement cosineSimilarity in JS or import it
  const scoredChunks = data.map((item) => ({
    ...item,
    similarity: cosineSimilarity(userQuestionEmbedding, item.embedding),
  }));
  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  return scoredChunks.slice(0, topK);
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
