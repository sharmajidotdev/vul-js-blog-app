# Header Injection Vulnerability

## Overview
HTTP Header Injection vulnerabilities allow attackers to inject newline characters into response headers, potentially leading to response splitting attacks or cache poisoning.

## CVE Reference
CVE-2016-10542

## Vulnerable Endpoint
- `/vuln/headerinj`

## How to Test

1. Navigate to Header Injection demo page:
   ```
   /vuln/headerinj
   ```

2. Try these test payloads:
   ```
   Normal-Header
   Injected-Header\r\nX-Injected: true
   Bad-Header\r\nSet-Cookie: session=hacked
   ```

## Example Attack Scenarios

### 1. Response Splitting
Input:
```
X-Custom-Header\r\nHTTP/1.1 200 OK\r\n
```

### 2. Cache Poisoning
Input:
```
X-Cache-Control\r\nCache-Control: public, max-age=31536000
```

## How It Works
The vulnerability occurs when user input is directly included in HTTP headers:

```javascript
// Vulnerable code
res.setHeader('X-Custom-Header', userInput);
```

## Prevention

1. Input Validation:
```javascript
if (header.includes('\r') || header.includes('\n')) {
  throw new Error('Invalid header');
}
```

2. Use Safe Header Methods:
   - Sanitize header values
   - Remove special characters
   - Use built-in header methods

3. Proper Error Handling
4. Use Security Headers
5. Implement HTTP Header Security Best Practices
