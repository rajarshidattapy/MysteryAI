import { supabase } from './supabaseClient'
import { cosineSimilarity } from "./../RAG/cosineUtils"
import { getEmbeddingFromHF } from "./../RAG/generateEmbeddingHF"

export const getRelevantContext = async (caseId, input) => {
  const inputEmbedding = await getEmbeddingFromHF(input)
  if (!inputEmbedding) return null

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

    data.forEach(item => {
      const score = cosineSimilarity(item.embedding, inputEmbedding)
      if (score > bestScore) {
        bestScore = score
        bestMatch = item.text
      }
    })

    return bestMatch
  } catch (error) {
    console.error("Error getting relevant context:", error)
    return null
  }
}