import { supabase } from './supabaseClient'
import { getEmbeddingFromHF } from "./../RAG/generateEmbeddingHF"
import { cosineSimilarity } from "./../RAG/cosineUtils"

export const queryRelevantEmbeddings = async (userQuestion, caseId, topK = 3) => {
  const questionEmbedding = await getEmbeddingFromHF(userQuestion)
  if (!questionEmbedding) return []

  try {
    const { data, error } = await supabase
      .from('embeddings')
      .select('*')
      .eq('case_id', caseId)
    
    if (error) {
      console.error("Error querying embeddings:", error)
      return []
    }

    const scoredChunks = []

    data.forEach(item => {
      if (!item.embedding || !Array.isArray(item.embedding)) return

      const score = cosineSimilarity(questionEmbedding, item.embedding)
      scoredChunks.push({
        ...item,
        similarity: score
      })
    })

    // Sort and pick top K
    scoredChunks.sort((a, b) => b.similarity - a.similarity)
    return scoredChunks.slice(0, topK)
  } catch (error) {
    console.error("Error querying embeddings:", error)
    return []
  }
}