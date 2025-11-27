// rag/queryRelevantEmbeddings.js
import { supabase } from "../src/supabaseClient";
import { cosineSimilarity } from "./cosineUtils";
import { getEmbeddingFromHF } from "./generateEmbeddingHF";

export const getRelevantContext = async (caseId, input) => {
  const inputEmbedding = await getEmbeddingFromHF(input);
  if (!inputEmbedding) return null;

  // Fetch embeddings for the case from Supabase
  const { data: embeddings, error } = await supabase
    .from('embeddings')
    .select('*')
    .eq('case_id', caseId);

  if (error) {
    console.error("Error fetching embeddings:", error);
    return null;
  }

  let bestMatch = null;
  let bestScore = -1;

  embeddings.forEach(record => {
    // Parse embedding if it's stored as a string, otherwise use as is
    const embeddingVector = typeof record.embedding === 'string'
      ? JSON.parse(record.embedding)
      : record.embedding;

    if (!embeddingVector) return;

    const score = cosineSimilarity(embeddingVector, inputEmbedding);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = record.text;
    }
  });

  return bestMatch;
};
