# Path Traversal Vulnerability

## Overview
Path Traversal (Directory Traversal) vulnerabilities allow attackers to access files and directories outside the intended directory by manipulating variables that reference files with "dot-dot-slash (../)" sequences.

## CVE Reference
CVE-2022-22965

## Vulnerable Endpoint
- `/vuln/traversal`

## How to Test

1. Navigate to Path Traversal demo page:
   ```
   /vuln/traversal
   ```

2. Try these test payloads:
   ```
   ../../etc/passwd
   ../../../etc/shadow
   ..\..\Windows\system.ini
   /etc/passwd
   file:///etc/passwd
   ```

## Example Attack Scenarios

### 1. Reading System Files
Input:
```
../../etc/passwd
```

### 2. Accessing Configuration Files
Input:
```
../config/database.js
```

## How It Works
The vulnerability occurs when user input is used directly in file system operations:

```javascript
// Vulnerable code
const content = fs.readFileSync(userInput);
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
   - Normalize paths
   - Check for directory traversal sequences
   - Implement proper access controls

3. Whitelist Allowed Files/Directories
4. Use Content-Disposition Headers
5. Implement Proper File Access Permissions
