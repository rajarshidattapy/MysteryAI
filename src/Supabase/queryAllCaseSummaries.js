import { supabase } from "./supabaseClient";

export const queryAllCaseSummaries = async () => {
  const { data, error } = await supabase
    .from("case_overview_embeddings")
    .select("*");
  if (error) {
    console.error("Error fetching case summaries:", error);
    return [];
  }
  return data;
};
