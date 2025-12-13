import { supabase } from "./supabaseClient";

// Store overview embedding for a case
export const storeOverviewEmbedding = async (caseId, summary, embedding) => {
  const { error } = await supabase
    .from("case_overview_embeddings")
    .insert({
      caseId,
      summary,
      embedding,
      createdAt: new Date().toISOString(),
    });
  if (error) {
    console.error("❌ Failed to store overview embedding:", error);
  } else {
    console.log("📌 Overview embedding stored");
  }
};
