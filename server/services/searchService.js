// Search service that merges activity and decision results into a shared semantic ranking.
const { semanticSearch } = require('./embeddingService');

async function searchItems(query, activityItems, decisionItems, topN = 10) {
  const normalizedActivities = (activityItems || []).map((item) => ({
    ...item,
    type: item.type || 'activity',
    content: item.content || '',
    filePath: item.file_path || item.filePath || null,
    createdAt: item.created_at || item.createdAt || null,
    embedding: item.embedding
  }));

  const normalizedDecisions = (decisionItems || []).map((item) => ({
    ...item,
    type: 'decision',
    content: `${item.title || ''} ${item.description || ''}`.trim(),
    filePath: null,
    createdAt: item.created_at || item.createdAt || null,
    embedding: item.embedding
  }));

  const results = await semanticSearch(query, [...normalizedActivities, ...normalizedDecisions], topN);
  return results.map((item) => ({
    type: item.type,
    content: item.content,
    filePath: item.filePath,
    score: item.score,
    createdAt: item.createdAt
  }));
}

module.exports = {
  searchItems
};
