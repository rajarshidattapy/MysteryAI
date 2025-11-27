import { supabase } from "../src/supabaseClient";

export const queryAllCaseSummaries = async () => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('id, case_title, case_overview, embedding')
      .not('embedding', 'is', null);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error querying case summaries:", error);
    return [];
  }
};