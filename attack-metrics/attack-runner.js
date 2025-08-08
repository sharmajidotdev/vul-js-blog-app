// attack-metrics/attack-runner.js
// Automated attack runner for XSS, SQLi, and other attacks


const axios = require('axios');
const fs = require('fs');
const { getXssPayloads, getSqliPayloads } = require('./attack-payloads');

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
    const xssPayloads = getXssPayloads();
    for (const payload of xssPayloads) {
      if (!payload || !payload.trim()) continue; // skip empty payloads
      try {
        const res = await axios.post(`${this.baseUrl}/posts/new`, {
          title: payload,
          content: 'XSS test content'
        });
        const responseStr = res.data && typeof res.data === 'string' ? res.data : '';
        const encoded = encodeURIComponent(payload);
        const htmlEncoded = payload.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        if (
          responseStr.includes(payload) ||
          responseStr.includes(encoded) ||
          responseStr.includes(htmlEncoded)
        ) {
          this.results.postXss.push({
            payload,
            status: res.status,
            reflected: true,
            responseSnippet: responseStr.substring(0, 300)
          });
        } else {
          this.results.errors.push({
            type: 'postXss',
            payload,
            error: 'Payload not reflected',
            status: res.status,
            responseSnippet: responseStr.substring(0, 300)
          });
        }
      } catch (e) {
        this.results.errors.push({type: 'postXss', payload, error: e.message});
      }
    }
    for (const payload of xssPayloads) {
      if (!payload || !payload.trim()) continue;
      try {
        const res = await axios.post(`${this.baseUrl}/posts/1/comment`, {
          comment: payload
        });
        const responseStr = res.data && typeof res.data === 'string' ? res.data : '';
        const encoded = encodeURIComponent(payload);
        const htmlEncoded = payload.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        if (
          responseStr.includes(payload) ||
          responseStr.includes(encoded) ||
          responseStr.includes(htmlEncoded)
        ) {
          this.results.commentXss.push({
            payload,
            status: res.status,
            reflected: true,
            responseSnippet: responseStr.substring(0, 300)
          });
        } else {
          this.results.errors.push({
            type: 'commentXss',
            payload,
            error: 'Payload not reflected',
            status: res.status,
            responseSnippet: responseStr.substring(0, 300)
          });
        }
      } catch (e) {
        this.results.errors.push({type: 'commentXss', payload, error: e.message});
      }
    }
    for (const payload of xssPayloads) {
      if (!payload || !payload.trim()) continue;
      try {
        const res = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(payload)}`);
        const responseStr = res.data && typeof res.data === 'string' ? res.data : '';
        const encoded = encodeURIComponent(payload);
        const htmlEncoded = payload.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        if (
          responseStr.includes(payload) ||
          responseStr.includes(encoded) ||
          responseStr.includes(htmlEncoded)
        ) {
          this.results.searchXss.push({
            payload,
            status: res.status,
            reflected: true,
            responseSnippet: responseStr.substring(0, 300)
          });
        } else {
          this.results.errors.push({
            type: 'searchXss',
            payload,
            error: 'Payload not reflected',
            status: res.status,
            responseSnippet: responseStr.substring(0, 300)
          });
        }
      } catch (e) {
        this.results.errors.push({type: 'searchXss', payload, error: e.message});
      }
    }
  }

  async runSQLiAttacks() {
    const sqlPayloads = getSqliPayloads();
    for (const payload of sqlPayloads) {
      try {
        const res = await axios.post(`${this.baseUrl}/login`, {
          username: payload,
          password: 'anything'
        });
        // Heuristic: If login is bypassed, response does not contain 'Invalid credentials'
        if (res.data && typeof res.data === 'string' && !res.data.includes('Invalid credentials')) {
          this.results.loginSqli.push({
            payload,
            status: res.status,
            bypassed: true,
            responseSnippet: res.data.substring(0, 300)
          });
        } else {
          this.results.errors.push({
            type: 'loginSqli',
            payload,
            error: 'Login not bypassed',
            status: res.status,
            responseSnippet: res.data && typeof res.data === 'string' ? res.data.substring(0, 300) : ''
          });
        }
      } catch (e) {
        this.results.errors.push({type: 'loginSqli', payload, error: e.message});
      }
    }
    for (const payload of sqlPayloads) {
      try {
        const res = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(payload)}`);
        // Heuristic: Look for SQL error or payload reflected
        if (res.data && typeof res.data === 'string' && (res.data.match(/sql/i) || res.data.includes(payload))) {
          this.results.searchSqli.push({
            payload,
            status: res.status,
            evidence: true,
            responseSnippet: res.data.substring(0, 300)
          });
        } else {
          this.results.errors.push({
            type: 'searchSqli',
            payload,
            error: 'No SQLi evidence',
            status: res.status,
            responseSnippet: res.data && typeof res.data === 'string' ? res.data.substring(0, 300) : ''
          });
        }
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
