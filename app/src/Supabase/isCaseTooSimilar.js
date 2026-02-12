import { supabase } from './supabaseClient'
import { cosineSimilarity } from "./../RAG/cosineUtils"

export const isCaseTooSimilar = async (embedding, threshold = 0.9) => {
  try {
    const { data, error } = await supabase
      .from('case_embeddings')
      .select('*')
    
    if (error) {
      console.error("Error checking case similarity:", error)
      return false
    }
    
    for (const item of data) {
      const existing = item
      const similarity = cosineSimilarity(existing.embedding, embedding)
      if (similarity > threshold) {
        console.log("⚠️ Similar case found. Similarity:", similarity)
        return true
      }
    }
    return false
  } catch (error) {
    console.error("Error checking case similarity:", error)
    return false
  }
}