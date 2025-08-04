# Open Redirect Vulnerability

## Overview
Open Redirect vulnerabilities occur when a web application accepts user input for redirect URLs without proper validation. Attackers can exploit this to redirect users to malicious websites while appearing to come from a trusted domain.

## CVE Reference
CVE-2022-3602

## Vulnerable Endpoint
- `/vuln/redirect`

## How to Test

1. Visit the Open Redirect demo page:
   ```
   /vuln/redirect
   ```

2. Try these test cases:
   ```
   /vuln/redirect?url=/posts                        # Internal redirect (safe)
   /vuln/redirect?url=https://google.com            # External redirect
   /vuln/redirect?url=https://evil-site.example.com # Malicious redirect
   ```

## Example Attack Scenarios

### Phishing Attack
1. Attacker creates a phishing site that looks like your application
2. Sends victims a link:
   ```
   https://your-site.com/vuln/redirect?url=https://evil-phishing-site.com
   ```
3. Users trust the link because it starts with your domain

## How It Works
The vulnerability exists because the application blindly accepts and redirects to any URL:

```javascript
router.get('/redirect', (req, res) => {
  const redirectUrl = req.query.url;
  res.redirect(redirectUrl); // Vulnerable!
});
```

## Prevention

1. Whitelist Approach:
```javascript
const allowedDomains = ['example.com', 'trusted-site.com'];
const url = new URL(redirectUrl, 'http://placeholder.com');

if (redirectUrl.startsWith('/') || allowedDomains.includes(url.hostname)) {
  res.redirect(redirectUrl);
} else {
  res.status(400).send('Invalid redirect URL');
}
```

2. Only allow relative URLs
3. Implement URL signature validation
4. Use a warning page for external redirects
