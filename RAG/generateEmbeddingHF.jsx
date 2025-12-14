import { supabase } from '../src/Supabase/supabaseClient'

const fetchFieldFromSupabase = async (tableName, docId, fieldName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(fieldName)
      .eq('id', docId)
      .single()
    
    if (error) {
      console.log("❌ Error fetching field:", error)
      return null
    }
    
    if (data) {
      return data[fieldName]
    } else {
      console.log("❌ No such document!")
      return null
    }
  } catch (error) {
    console.error("🔥 Error fetching field:", error)
    return null
  }
}

export const getEmbeddingFromHF = async (text) => {
    let ApiKey = await fetchFieldFromSupabase("apis", "0", "huggingface_api")
    
    // Fallback API key if Supabase fetch fails
    if (!ApiKey) {
      console.warn("⚠️ No API key found in Supabase, using fallback key")
      // You should replace this with a valid HuggingFace API key
      ApiKey = "" // Replace with actual fallback key
    }
    
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: text
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ HuggingFace API error:", response.status, errorText)
        return null
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("🔥 Error calling HuggingFace API:", error)
      return null
    }
}