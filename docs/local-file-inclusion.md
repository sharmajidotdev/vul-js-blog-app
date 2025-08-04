# Local File Inclusion Vulnerability

## Overview
Local File Inclusion (LFI) vulnerabilities allow attackers to include files on a server through the web application. This can lead to source code disclosure, sensitive data exposure, and in some cases, remote code execution.

## CVE Reference
CVE-2018-1000525

## Vulnerable Endpoint
- `/vuln/lfi`

## How to Test

1. Navigate to LFI demo page:
   ```
   /vuln/lfi
   ```

2. Try these test payloads:
   ```
   ../../etc/passwd
   ../../../etc/shadow
   /etc/hosts
   C:\Windows\system.ini
   php://filter/convert.base64-encode/resource=index.php
   ```

## Example Attack Scenarios

### 1. Reading System Files
Input:
```
../../etc/passwd
```

### 2. Source Code Disclosure
Input:
```
../config/database.js
```

### 3. Log File Poisoning
1. Inject PHP code into log file
2. Include the log file through LFI

## How It Works
The vulnerability occurs when user input is used directly in file inclusion:

```javascript
// Vulnerable code
const content = require(userInput);
```

## Prevention

1. Input Validation:
```javascript
const path = require('path');
const filePath = path.resolve(baseDir, userInput);
if (!filePath.startsWith(baseDir)) {
  throw new Error('Invalid path');
}
```

2. Use Safe File Operations:
   - Whitelist allowed files
   - Use absolute paths
   - Implement proper access controls

3. Disable Remote File Inclusion
4. Implement Proper File Permissions
5. Use Content Security Policy (CSP)
