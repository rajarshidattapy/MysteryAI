import { supabase } from './supabaseClient'

export const queryAllCaseSummaries = async () => {
  try {
    const { data, error } = await supabase
      .from('case_overview_embeddings')
      .select('*')
    
    if (error) {
      console.error("Error querying case summaries:", error)
      return []
    }
    
    return data.map(item => ({ ...item, id: item.id }))
  } catch (error) {
    console.error("Error querying case summaries:", error)
    return []
  }
}