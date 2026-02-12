// /src/Supabase/storeOverviewEmbedding.js
import { supabase } from '../src/Supabase/supabaseClient'

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