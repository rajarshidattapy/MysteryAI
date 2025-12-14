import { supabase } from './supabaseClient'

// Store embeddings for case
export const storeEmbeddingsForCase = async (caseData, caseId) => {
  try {
    const itemsToEmbed = []

    // Loop through suspects
    caseData.suspects.forEach((suspect) => {
      itemsToEmbed.push({
        case_id: caseId,
        role: "suspect",
        name: suspect.name,
        field: "alibi",
        text: suspect.alibi
      })
    })

    // Loop through witnesses
    caseData.witnesses?.forEach((witness) => {
      itemsToEmbed.push({
        case_id: caseId,
        role: "witness",
        name: witness.name,
        field: "observation",
        text: witness.observation
      })
    })

    // Insert all embeddings
    const { error } = await supabase
      .from('embeddings')
      .insert(itemsToEmbed)
    
    if (error) {
      console.error("Error storing embeddings:", error)
      return
    }

    console.log("Embeddings saved for case:", caseId)
  } catch (error) {
    console.error("Error storing embeddings:", error)
  }
}

// Store overview embedding
export const storeOverviewEmbedding = async (caseId, summary, embedding) => {
  try {
    const { error } = await supabase
      .from('case_overview_embeddings')
      .insert([
        {
          case_id: caseId,
          summary: summary,
          embedding: embedding,
          created_at: new Date()
        }
      ])
    
    if (error) {
      console.error("Failed to store overview embedding:", error)
      return
    }
    
    console.log("Overview embedding stored")
  } catch (err) {
    console.error("Failed to store overview embedding:", err)
  }
}