// rag/queryRelevantEmbeddings.js
import { supabase } from '../src/Supabase/supabaseClient'
import { cosineSimilarity } from "./cosineUtils"
import { getEmbeddingFromHF } from "./generateEmbeddingHF"

export const getRelevantContext = async (caseId, input) => {
  const inputEmbedding = await getEmbeddingFromHF(input)

  if (!inputEmbedding) {
    console.info("💡 RAG context disabled - continuing without embeddings")
    return null
  }

  // Guard: Return null if Supabase is not configured
  if (!supabase) {
    console.warn("⚠️ Supabase not configured - skipping context retrieval")
    return null
  }

  try {
    const { data, error } = await supabase
      .from('embeddings')
      .select('*')
      .eq('case_id', caseId)

    if (error) {
      console.error("Error getting relevant context:", error)
      return null
    }

    let bestMatch = null
    let bestScore = -1

    data.forEach(doc => {
      const data = doc
      const score = cosineSimilarity(data.embedding, inputEmbedding)
      if (score > bestScore) {
        bestScore = score
        bestMatch = data.text
      }
    })

    return bestMatch
  } catch (error) {
    console.error("Error getting relevant context:", error)
    return null
  }
}