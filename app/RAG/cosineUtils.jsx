export const cosineSimilarity = (a, b) => {
    // Check if inputs are valid arrays
    if (!Array.isArray(a) || !Array.isArray(b)) {
      console.error("Invalid input to cosineSimilarity:", { a, b });
      return 0;
    }

    // Check if arrays have the same length
    if (a.length !== b.length) {
      console.error("Embedding dimension mismatch:", { aLength: a.length, bLength: b.length });
      return 0;
    }

    // Check if arrays contain valid numbers
    if (a.some(x => typeof x !== 'number' || isNaN(x)) || b.some(x => typeof x !== 'number' || isNaN(x))) {
      console.error("Invalid embedding values:", { a, b });
      return 0;
    }

    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));

    // Avoid division by zero
    if (magA === 0 || magB === 0) {
      return 0;
    }

    return dot / (magA * magB);
  };