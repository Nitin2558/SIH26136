const { getDB, saveDB, generateId } = require('../db/store');

/**
 * Calculate Jaccard similarity / Token overlap between two strings
 */
function calculateTextSimilarity(str1, str2) {
  const normalize = (text) => text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const words1 = new Set(normalize(str1));
  const words2 = new Set(normalize(str2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach(word => {
    if (words2.has(word)) intersection++;
  });

  const union = words1.size + words2.size - intersection;
  return intersection / union;
}

/**
 * Execute Pattern Aggregation Pass
 * @param {number} threshold Min cluster size to create an aggregated problem card (default 3 for demo)
 */
function runPatternAggregation(threshold = 3) {
  const db = getDB();
  const startTime = new Date().toISOString();
  
  // Filter un-aggregated general-grievance and needs-review submissions
  const candidateProblems = db.problems.filter(p => 
    (p.status === 'general-grievance' || p.status === 'needs-review') &&
    !p.isAggregated &&
    !p.aggregatedIntoId
  );

  // Group by category and state/district
  const groups = {};
  candidateProblems.forEach(p => {
    const key = `${p.category || 'General'}::${p.locationState || 'Any'}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  let clustersCreated = 0;
  const newAggregatedProblems = [];

  Object.entries(groups).forEach(([groupKey, problems]) => {
    if (problems.length < threshold) return;

    // Cluster similar items within the group
    const clusters = [];
    const visited = new Set();

    for (let i = 0; i < problems.length; i++) {
      if (visited.has(problems[i].id)) continue;

      const currentCluster = [problems[i]];
      visited.add(problems[i].id);

      for (let j = i + 1; j < problems.length; j++) {
        if (visited.has(problems[j].id)) continue;

        const sim = calculateTextSimilarity(
          `${problems[i].title} ${problems[i].description}`,
          `${problems[j].title} ${problems[j].description}`
        );

        if (sim >= 0.20) { // Similarity threshold for grouping
          currentCluster.push(problems[j]);
          visited.add(problems[j].id);
        }
      }

      if (currentCluster.length >= threshold) {
        clusters.push(currentCluster);
      }
    }

    // Process clusters into Aggregated Research-Worthy Problem Cards
    clusters.forEach(cluster => {
      clustersCreated++;
      const [category, region] = groupKey.split('::');
      const sourceIds = cluster.map(item => item.id);
      const leadProblem = cluster[0];

      const aggTitle = `Systemic Innovation Challenge: ${leadProblem.title} Pattern in ${region !== 'Any' ? region : 'Multiple Regions'}`;
      const aggDesc = `Recurring pattern detected: ${cluster.length} citizen & official reports regarding "${leadProblem.title}" in ${region !== 'Any' ? region : 'various areas'}.\n\n` +
        `Aggregated Insights:\n` +
        cluster.map((item, idx) => `${idx + 1}. ${item.title} (${item.locationDistrict || item.locationState || 'Local'})`).join('\n') +
        `\n\nPotential systemic/technological research solution required to address root cause rather than individual symptoms.`;

      const aggProblemId = generateId();

      const newAggProblem = {
        id: aggProblemId,
        title: aggTitle,
        description: aggDesc,
        category: leadProblem.category || 'Infrastructure',
        locationState: leadProblem.locationState || 'Multi-State',
        locationDistrict: leadProblem.locationDistrict || 'Multiple Districts',
        submitterId: 'system-aggregator',
        submitterName: 'System Pattern Aggregator',
        submitterType: 'system',
        departmentName: leadProblem.departmentName || 'Civic Infrastructure Dept',
        canBeAddressed: 'Yes',
        status: 'research-worthy',
        confidence: 0.95,
        aiReason: `Auto-generated research card created from a cluster of ${cluster.length} matching civic reports. Elevated to research status due to recurring pattern.`,
        isAggregated: true,
        sourceProblemIds: sourceIds,
        createdAt: new Date().toISOString(),
        upvotes: cluster.length * 5,
        downvotes: 0
      };

      // Mark source problems as aggregated
      sourceIds.forEach(id => {
        const src = db.problems.find(p => p.id === id);
        if (src) {
          src.aggregatedIntoId = aggProblemId;
        }
      });

      db.problems.unshift(newAggProblem);
      newAggregatedProblems.push(newAggProblem);
    });
  });

  const endTime = new Date().toISOString();

  // Log execution
  const logEntry = {
    id: generateId(),
    timestamp: endTime,
    candidatesEvaluated: candidateProblems.length,
    clustersCreated,
    thresholdUsed: threshold,
    createdProblemIds: newAggregatedProblems.map(p => p.id),
    status: 'success'
  };

  db.aggregationLogs.unshift(logEntry);
  saveDB();

  console.log(`[Pattern Aggregator] Pass complete: Evaluated ${candidateProblems.length} candidates, created ${clustersCreated} aggregated problem cards.`);
  return logEntry;
}

module.exports = {
  runPatternAggregation,
  calculateTextSimilarity
};
