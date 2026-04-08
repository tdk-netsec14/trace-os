// Local embedding generation and semantic search helpers for the server.
const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text';

function getOllamaBaseUrl() {
  return process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
}

async function generateEmbedding(text) {
  try {
    if (!text || typeof text !== 'string') {
      return null;
    }

    const response = await fetch(`${getOllamaBaseUrl()}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const embedding = data.embedding || data.embeddings?.[0];
    return Array.isArray(embedding) ? embedding.map(Number) : null;
  } catch (error) {
    return null;
  }
}

function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || !vecA.length || !vecB.length) {
    return 0;
  }

  const length = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < length; index += 1) {
    const valueA = Number(vecA[index]) || 0;
    const valueB = Number(vecB[index]) || 0;
    dotProduct += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  if (!magnitudeA || !magnitudeB) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

async function semanticSearch(query, items, topN = 10) {
  try {
    const queryEmbedding = await generateEmbedding(query);

    if (!queryEmbedding) {
      const loweredQuery = String(query || '').toLowerCase();
      return items
        .filter((item) => String(item.content || '').toLowerCase().includes(loweredQuery))
        .slice(0, topN)
        .map((item) => ({
          ...item,
          score: 1
        }));
    }

    return items
      .map((item) => ({
        ...item,
        score: cosineSimilarity(queryEmbedding, safeParseEmbedding(item.embedding))
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, topN);
  } catch (error) {
    return [];
  }
}

function safeParseEmbedding(value) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateEmbedding,
  cosineSimilarity,
  semanticSearch
};
