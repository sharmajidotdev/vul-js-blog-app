const VulnerabilityScanner = require('../utils/vulnerability-scanner');
const SecurityMetrics = require('../utils/security-metrics');

async function runSecurityTests() {
  console.log('Starting Security Tests...');
  
  // Initialize scanner and metrics
  const scanner = new VulnerabilityScanner('http://localhost:3000');
  const metrics = new SecurityMetrics();

  // Run vulnerability scan
  const scanResults = await scanner.runFullScan();
  
  // Calculate security metrics
  metrics.calculateVulnScore('xss', scanResults.vulnerabilitiesFound.xss, 0.8, 0.5, 0.7);
  metrics.calculateVulnScore('sqli', scanResults.vulnerabilitiesFound.sqli, 0.9, 0.6, 0.8);
  metrics.calculateVulnScore('openRedirect', scanResults.vulnerabilitiesFound.openRedirect, 0.5, 0.3, 0.4);
  metrics.calculateVulnScore('lfi', scanResults.vulnerabilitiesFound.lfi, 0.7, 0.4, 0.6);
  
  // Generate final report
  const securityReport = metrics.generateReport();
  
  console.log('\nSecurity Test Results:');
  console.log('----------------------');
  console.log(`Overall Security Score: ${securityReport.overallScore}`);
  console.log(`Vulnerabilities Found: ${Object.values(scanResults.vulnerabilitiesFound).reduce((a,b) => a+b, 0)}`);
  console.log('\nDetailed Results:');
  console.log(JSON.stringify(securityReport, null, 2));
}

runSecurityTests();
