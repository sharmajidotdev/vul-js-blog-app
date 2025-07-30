const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { title } = require('process');

router.get('/', (req, res) => {
  res.render('vuln', { title: 'Vulnerability Demos' });
});
// SQL Injection (simulated)
router.get('/sqlinj', (req, res) => {
  res.render('sqlinj', { result: null, cve: 'CVE-2023-23752' , title: 'SQL Injection Demo' });
});
router.post('/sqlinj', (req, res) => {
  const username = req.body.username;
  // Simulate SQL query (vulnerable)
  let result;
  if (username === "' OR 1=1 --") {
    result = "All users returned! (Simulated SQL Injection)";
  } else {
    result = "No user found.";
  }
  res.render('sqlinj', { result, cve: 'CVE-2023-23752' , title: 'SQL Injection Demo' });
});

// Command Injection (simulated)
router.get('/cmdinj', (req, res) => {
  res.render('cmdinj', { output: null, cve: 'CVE-2021-41773' , title: 'Command Injection Demo' });
});
router.post('/cmdinj', (req, res) => {
  const name = req.body.name;
  // Simulate command injection (DO NOT EXECUTE in real apps)
  let output;
  if (name.includes(';')) {
    output = "Command injection detected! (Simulated)";
  } else {
    output = `Hello, ${name}`;
  }
  res.render('cmdinj', { output, cve: 'CVE-2021-41773' , title: 'Command Injection Demo' });
});

// Path Traversal (simulated)
router.get('/traversal', (req, res) => {
  res.render('traversal', { fileContent: null, cve: 'CVE-2022-22965' , title: 'Path Traversal Demo' });
});
router.post('/traversal', (req, res) => {
  const filename = req.body.filename;
  let fileContent;
  if (filename === '../../etc/passwd') {
    fileContent = 'root:x:0:0:root:/root:/bin/bash\n... (simulated)';
  } else {
    fileContent = 'File not found or not allowed.';
  }
  res.render('traversal', { fileContent, cve: 'CVE-2022-22965' , title: 'Path Traversal Demo' });
});

// HTTP Header Injection (simulated)
router.get('/headerinj', (req, res) => {
  res.render('headerinj', { cve: 'CVE-2016-10542' , title: 'HTTP Header Injection Demo' });
});
router.post('/headerinj', (req, res) => {
  const header = req.body.header;
  // Simulate header injection
  if (header.includes('\r') || header.includes('\n')) {
    res.set('X-Injected', 'true');
  }
  res.render('headerinj', { cve: 'CVE-2016-10542' , title: 'HTTP Header Injection Demo' });
});

// Open Redirect
router.get('/redirect', (req, res) => {
  res.render('redirect', { cve: 'CVE-2022-3602' , title: 'Open Redirect Demo' });
});
router.post('/redirect', (req, res) => {
  const url = req.body.url;
  // Vulnerable redirect
  return res.redirect(url);
});

// Local File Inclusion (simulated)
router.get('/lfi', (req, res) => {
  res.render('lfi', { fileContent: null, cve: 'CVE-2018-1000525', title: 'Local File Inclusion Demo'});
});
router.post('/lfi', (req, res) => {
  const file = req.body.file;
  let fileContent;
  if (file === '../../etc/passwd') {
    fileContent = 'root:x:0:0:root:/root:/bin/bash\n... (simulated)';
  } else {
    fileContent = 'File not found or not allowed.';
  }
  res.render('lfi', { fileContent, cve: 'CVE-2018-1000525' , title: 'Local File Inclusion Demo' });
});

module.exports = router;