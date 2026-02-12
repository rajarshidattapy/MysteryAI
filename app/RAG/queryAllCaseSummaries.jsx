import { supabase } from '../src/Supabase/supabaseClient'

export const queryAllCaseSummaries = async () => {
  try {
    const { data, error } = await supabase
      .from('case_overview_embeddings')
      .select('*')

    if (error) {
      console.error("Error querying case summaries:", error)
      return []
    }

    return data.map(doc => ({ ...doc, id: doc.id }))
  } catch (error) {
    console.error("Error querying case summaries:", error)
    return []
  }
}