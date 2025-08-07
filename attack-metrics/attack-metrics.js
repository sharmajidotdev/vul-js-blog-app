// attack-metrics/attack-metrics.js
// Utility to calculate secureness and vulnerabilities from attack reports

const fs = require('fs');
const path = require('path');

function getLatestAttackReport() {
  const reportsDir = path.join(__dirname, '/reports');
  const files = fs.readdirSync(reportsDir)
    .filter(f => f.startsWith('attack-') && f.endsWith('.json'))
    .sort();
  if (!files.length) return null;
  const latest = files[files.length - 1];
  return JSON.parse(fs.readFileSync(path.join(reportsDir, latest)));
}


function calculateMetrics(report) {
  if (!report) {
    return {
      secureness: 0,
      vulnerabilities: 0,
      details: {},
      totalAttacks: 0,
      failedAttacks: 0,
      successRate: 0,
      breakdown: {},
      overallScore: 0,
      vulnScores: {},
      summary: {}
    };
  }
  const results = report.results;
  const breakdown = {
    postXss: results.postXss?.length || 0,
    commentXss: results.commentXss?.length || 0,
    searchXss: results.searchXss?.length || 0,
    loginSqli: results.loginSqli?.length || 0,
    searchSqli: results.searchSqli?.length || 0
  };
  let vulnerabilities = breakdown.postXss + breakdown.commentXss + breakdown.searchXss + breakdown.loginSqli + breakdown.searchSqli;
  let totalAttacks = vulnerabilities + (results.errors?.length || 0);
  let failedAttacks = results.errors?.length || 0;
  let successRate = totalAttacks > 0 ? ((vulnerabilities / totalAttacks) * 100).toFixed(2) : 0;
  // Per-vulnerability scores (weights can be tuned)
  const vulnScores = {
    xss: scoreVuln(breakdown.postXss + breakdown.commentXss + breakdown.searchXss, 0.8, 0.5, 0.7),
    sqli: scoreVuln(breakdown.loginSqli + breakdown.searchSqli, 0.9, 0.6, 0.8),
    openRedirect: scoreVuln(0, 0.5, 0.3, 0.4),
    lfi: scoreVuln(0, 0.7, 0.4, 0.6)
  };
  // Overall score (average of all vuln scores)
  const overallScore = (
    vulnScores.xss + vulnScores.sqli + vulnScores.openRedirect + vulnScores.lfi
  ) / 4;
  // Secureness: weighted by attack type, penalize more for XSS/SQLi
  let weights = { postXss: 3, commentXss: 3, searchXss: 2, loginSqli: 4, searchSqli: 2 };
  let maxScore = 100;
  let penalty = 0;
  for (let type in breakdown) {
    penalty += breakdown[type] * (weights[type] || 1);
  }
  let secureness = Math.max(0, maxScore - penalty);
  // Summary for easy reporting
  const summary = {
    overallScore,
    vulnScores,
    vulnerabilities,
    totalAttacks,
    failedAttacks,
    successRate: Number(successRate),
    breakdown
  };
  return {
    secureness,
    vulnerabilities,
    totalAttacks,
    failedAttacks,
    successRate: Number(successRate),
    breakdown,
    details: results,
    overallScore,
    vulnScores,
    summary
  };
}

// Simple scoring function for vulnerabilities (imitates calculateVulnScore)
function scoreVuln(count, impact, exploitability, prevalence) {
  // Example: CVSS-like, but simplified
  // Lower is better (0 = no vuln, 10 = max vuln)
  if (count === 0) return 10;
  let base = (impact * 0.5 + exploitability * 0.3 + prevalence * 0.2) * 10;
  // More vulns = lower score
  return Math.max(0, 10 - count * base * 0.1);
}

module.exports = {
  getLatestAttackReport,
  calculateMetrics
};
