import { supabase } from "../src/supabaseClient";

const fetchFieldFromSupabase = async (tableName, docId, fieldName) => {
  try {
    // Note: This assumes a table structure where we can fetch by some ID.
    // Since we don't have the original Firestore data structure in Supabase yet,
    // this is a placeholder. In a real migration, you'd have an 'app_config' or 'apis' table.
    // For now, we'll return null to trigger the fallback.
    return null;

    /* 
    // Example implementation if table exists:
    const { data, error } = await supabase
      .from(tableName)
      .select(fieldName)
      .eq('id', docId)
      .single();

    if (error) return null;
    return data ? data[fieldName] : null;
    */
  } catch (error) {
    console.error("🔥 Error fetching field:", error);
    return null;
  }
};

export const getEmbeddingFromHF = async (text) => {
  // Try to fetch from Supabase (will likely fail/return null and use fallback)
  let ApiKey = await fetchFieldFromSupabase("apis", "0", "huggingface_api");

  // Fallback API key
  if (!ApiKey) {
    // console.warn("⚠️ No API key found, using fallback key");
    ApiKey = "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";
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
          inputs: text,
          options: {
            wait_for_model: true
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (Array.isArray(result) && Array.isArray(result[0])) {
      const avg = result[0].map((_, i) =>
        result.reduce((sum, row) => sum + row[i], 0) / result.length
      );
      return avg;
    }

    if (Array.isArray(result) && result.length === 384) {
      return result;
    }

    // Check if the result indicates an authentication error
    if (result.error && result.error.includes("authentication")) {
      console.error("❌ HuggingFace API authentication failed. Please check your API key.");
      return null;
    }

    console.warn("⚠️ Unexpected response format from HuggingFace:", result);
    return null;
  } catch (err) {
    console.error("❌ Failed to get embedding:", err);
    return null;
  }
};