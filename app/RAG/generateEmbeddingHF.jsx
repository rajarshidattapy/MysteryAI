import { supabase } from '../src/Supabase/supabaseClient'

const fetchFieldFromSupabase = async (tableName, docId, fieldName) => {
  // Guard: Return null if Supabase is not configured
  if (!supabase) {
    console.warn("⚠️ Supabase not configured - skipping field fetch")
    return null
  }

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
    // NOTE: HuggingFace API calls from browser are blocked by CORS
    // This is an optional feature for RAG context enhancement
    // The game works perfectly without embeddings

    console.warn("⚠️ HuggingFace embeddings disabled (CORS restriction from browser)")
    console.info("💡 Embeddings are optional - game works without them")
    console.info("💡 To enable: Set up a backend proxy or use server-side generation")

    // Return null to indicate embeddings are not available
    // This will cause the game to skip similarity checks and RAG context
    return null

    /* CORS-blocked code - keeping for reference if you add a backend proxy

    let ApiKey = await fetchFieldFromSupabase("apis", "0", "huggingface_api")

    if (!ApiKey) {
      console.warn("⚠️ No API key found in Supabase")
      ApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || ""
    }

    if (!ApiKey) {
      console.warn("⚠️ No HuggingFace API key configured")
      return null
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
      if (error.message?.includes('Failed to fetch')) {
        console.warn("⚠️ HuggingFace API blocked by CORS - embeddings disabled")
      } else {
        console.error("❌ Error calling HuggingFace API:", error)
      }
      return null
    }
    */
}