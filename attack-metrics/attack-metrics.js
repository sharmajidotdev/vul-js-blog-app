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
      breakdownAttempts: {},
      breakdownBlocked: {},
      overallScore: 0,
      vulnScores: {},
      summary: {}
    };
  }
  const results = report.results;
  // Dynamically detect attack types from report
  const attackTypes = Object.keys(results).filter(k => k !== 'errors');
  // Calculate per-type attempted and blocked based on actual report data
  const breakdown = {};
  const breakdownAttempts = {};
  const breakdownBlocked = {};
  let vulnerabilities = 0;
  let totalAttacks = 0;
  for (const type of attackTypes) {
    const attempted = Array.isArray(results[type]) ? results[type].length : 0;
    const successful = attempted; // In this model, all attempted == successful (since only successes are stored)
    breakdown[type] = successful;
    breakdownAttempts[type] = attempted;
    breakdownBlocked[type] = 0; // We don't know blocked unless runner logs them
    vulnerabilities += successful;
    totalAttacks += attempted;
  }
  let failedAttacks = results.errors?.length || 0;
  // If errors are per-payload, treat as attempted but not successful
  for (const err of results.errors || []) {
    if (err && err.type && breakdownAttempts.hasOwnProperty(err.type)) {
      breakdownAttempts[err.type] += 1;
      breakdownBlocked[err.type] += 1;
      totalAttacks += 1;
    }
  }
  // Now blocked = attempted - successful
  for (const type of attackTypes) {
    breakdownBlocked[type] = breakdownAttempts[type] - breakdown[type];
  }
  let successRate = totalAttacks > 0 ? ((vulnerabilities / totalAttacks) * 100).toFixed(2) : 0;
  // Per-vulnerability scores (weights can be tuned)
  const vulnScores = {
    xss: scoreVuln((breakdown.postXss||0) + (breakdown.commentXss||0) + (breakdown.searchXss||0), 0.8, 0.5, 0.7),
    sqli: scoreVuln((breakdown.loginSqli||0) + (breakdown.searchSqli||0), 0.9, 0.6, 0.8),
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
  // Calculate both success rates for UI
  const successRateBlocked = totalAttacks > 0 ? ((totalAttacks - vulnerabilities) / totalAttacks * 100).toFixed(2) : '0.00';
  const successRateAttacker = totalAttacks > 0 ? ((vulnerabilities / totalAttacks) * 100).toFixed(2) : '0.00';
  // Summary for easy reporting
  const summary = {
    overallScore,
    vulnScores,
    vulnerabilities,
    totalAttacks,
    failedAttacks,
    successRate: Number(successRate),
    successRateBlocked: Number(successRateBlocked),
    successRateAttacker: Number(successRateAttacker),
    breakdown,
    breakdownAttempts,
    breakdownBlocked
  };
  return {
    secureness,
    vulnerabilities,
    totalAttacks,
    failedAttacks,
    successRate: Number(successRate),
    successRateBlocked: Number(successRateBlocked),
    successRateAttacker: Number(successRateAttacker),
    breakdown,
    breakdownAttempts,
    breakdownBlocked,
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
