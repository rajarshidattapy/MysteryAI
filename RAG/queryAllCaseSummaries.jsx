import { collection, getDocs } from "firebase/firestore";
import { db } from "./../Firebase/casesDb";

export const queryAllCaseSummaries = async () => {
  const snapshot = await getDocs(collection(db, "case_overview_embeddings"));
  return snapshot.docs
    .map(doc => ({ ...doc.data(), id: doc.id }));
};