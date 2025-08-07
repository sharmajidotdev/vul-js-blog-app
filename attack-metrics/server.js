const express = require('express');
const path = require('path');
const attackMetrics = require('./attack-metrics');
const AttackRunner = require('./attack-runner');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname));
// Serve static files from /public at root
app.use('/', express.static(path.join(__dirname, 'public')));

// Home page: show metrics and attack button
app.get('/', (req, res) => {
  res.render('metrics', { title: 'Attack Metrics' });
});

// API: Get metrics
app.get('/metrics/attack-metrics', (req, res) => {
  const report = attackMetrics.getLatestAttackReport();
  const metrics = attackMetrics.calculateMetrics(report);
  res.json(metrics);
});

// API: Run attack
app.post('/attack', async (req, res) => {
  const runner = new AttackRunner('http://localhost:3000'); // Target URL can be made configurable
  await runner.runAllAttacks();
  res.json({ success: true });
});

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Attack Metrics server running at http://localhost:${PORT}`);
});
