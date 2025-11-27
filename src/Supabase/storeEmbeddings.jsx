import { supabase } from '../supabaseClient';
import { getEmbeddingFromHF } from "../../RAG/generateEmbeddingHF";

export const storeEmbeddingsForCase = async (caseData, caseId) => {
    const itemsToEmbed = [];

    // 1️⃣ Loop through suspects
    caseData.suspects.forEach((suspect) => {
        itemsToEmbed.push({
            case_id: caseId,
            role: "suspect",
            name: suspect.name,
            field: "alibi",
            text: suspect.alibi
        });
    });

    // 2️⃣ Loop through witnesses
    caseData.witnesses?.forEach((witness) => {
        itemsToEmbed.push({
            case_id: caseId,
            role: "witness",
            name: witness.name,
            field: "observation",
            text: witness.observation
        });
    });

    // 3️⃣ Generate and save embeddings
    for (const item of itemsToEmbed) {
        const embedding = await getEmbeddingFromHF(item.text);
        if (!embedding) continue;

        const { error } = await supabase
            .from('embeddings')
            .insert([
                {
                    ...item,
                    embedding // Assumes vector column or array
                }
            ]);

        if (error) {
            console.error("Error storing embedding:", error);
        }
    }

    console.log("✅ Embeddings saved for case:", caseId);
};
