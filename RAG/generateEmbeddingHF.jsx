import {db} from "./../Firebase/casesDb";

import { getDoc, doc } from "firebase/firestore";

const fetchFieldFromFirestore = async (collectionName, docId, fieldName) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data[fieldName]; // 🎯 Return only the specific field
    } else {
      console.log("❌ No such document!");
      return null;
    }
  } catch (error) {
    console.error("🔥 Error fetching field:", error);
    return null;
  }
};

export const getEmbeddingFromHF = async (text) => {
    let ApiKey = await fetchFieldFromFirestore("Apis","0","huggingfaceApi");
    
    // Fallback API key if Firestore fetch fails
    if (!ApiKey) {
      console.warn("⚠️ No API key found in Firestore, using fallback key");
      // You should replace this with a valid HuggingFace API key
      ApiKey = "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"; // Replace with actual fallback key
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