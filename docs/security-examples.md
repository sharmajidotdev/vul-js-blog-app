# Security Implementation Examples

## 1. Input Validation Examples

### Vulnerable Code:
```javascript
app.post('/posts/create', (req, res) => {
  const { title, content } = req.body;
  // No validation - directly using input
  db.query(`INSERT INTO posts (title, content) VALUES ('${title}', '${content}')`);
});
```

### Secure Code:
```javascript
const SecurityUtils = require('../utils/security-utils');

app.post('/posts/create', (req, res) => {
  try {
    const title = SecurityUtils.validateInput(req.body.title, {
      type: 'string',
      maxLength: 200,
      pattern: /^[a-zA-Z0-9\s.,!?-]+$/
    });
    
    const content = SecurityUtils.validateInput(req.body.content, {
      type: 'string',
      maxLength: 5000,
      pattern: /^[\w\s.,!?-]+$/
    });
    
    // Use parameterized query
    db.execute(
      'INSERT INTO posts (title, content) VALUES (?, ?)',
      [title, content]
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 2. SQL Injection Prevention

### Vulnerable Code:
```javascript
app.post('/users/search', (req, res) => {
  const { query } = req.body;
  // Direct string concatenation - vulnerable to SQL injection
  db.query(`SELECT * FROM users WHERE username LIKE '%${query}%'`);
});
```

### Secure Code:
```javascript
app.post('/users/search', (req, res) => {
  const { query } = req.body;
  // Using parameterized query
  db.execute(
    'SELECT * FROM users WHERE username LIKE ?',
    [`%${SecurityUtils.escapeSQLInput(query)}%`]
  );
});
```

## 3. XSS Prevention

### Vulnerable Code:
```javascript
app.get('/profile', (req, res) => {
  const { name } = req.query;
  // Directly outputting user input
  res.send(`<h1>Welcome ${name}!</h1>`);
});
```

### Secure Code:
```javascript
app.get('/profile', (req, res) => {
  const { name } = req.query;
  // Encoding output
  const safeName = SecurityUtils.encodeHTML(name);
  res.send(`<h1>Welcome ${safeName}!</h1>`);
});
```

## 4. Open Redirect Prevention

### Vulnerable Code:
```javascript
app.get('/redirect', (req, res) => {
  const { url } = req.query;
  // No validation of redirect URL
  res.redirect(url);
});
```

### Secure Code:
```javascript
app.get('/redirect', (req, res) => {
  const { url } = req.query;
  // Checking against whitelist
  if (SecurityUtils.isAllowedDomain(url)) {
    res.redirect(url);
  } else {
    res.status(400).json({ error: 'Invalid redirect URL' });
  }
});
```

## 5. File Path Validation

### Vulnerable Code:
```javascript
app.get('/download', (req, res) => {
  const { file } = req.query;
  // No path validation
  res.sendFile(file);
});
```

### Secure Code:
```javascript
const path = require('path');

app.get('/download', (req, res) => {
  const { file } = req.query;
  // Validate file type and normalize path
  if (SecurityUtils.isAllowedFileType(file)) {
    const safePath = path.normalize(file).replace(/^(\.\.[\/\\])+/, '');
    res.sendFile(path.join(__dirname, 'uploads', safePath));
  } else {
    res.status(400).json({ error: 'Invalid file type' });
  }
});
```
