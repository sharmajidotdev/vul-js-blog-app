# Command Injection Vulnerability

## Overview
Command Injection is a vulnerability that allows attackers to execute arbitrary system commands on the host running an application through a vulnerable application.

## CVE Reference
CVE-2021-41773

## Vulnerable Endpoint
- `/vuln/cmdinj`

## How to Test

1. Navigate to the Command Injection demo page:
   ```
   /vuln/cmdinj
   ```

2. Try these test payloads:
   ```
   ; ls
   && whoami
   | cat /etc/passwd
   `id`
   $(pwd)
   ```

## Example Attack Scenarios

### 1. Basic Command Injection
Input:
```
John; ls
```

### 2. Chained Commands
Input:
```
Jane && cat /etc/passwd
```

## How It Works
The vulnerability exists when user input is passed directly to system commands:

```javascript
// Vulnerable code
const output = execSync(`echo Hello, ${name}`);
```

## Prevention

1. Input Validation:
```javascript
if (!/^[a-zA-Z0-9\s]+$/.test(userInput)) {
  throw new Error('Invalid input');
}
```

2. Use safe alternatives:
   - Avoid system commands when possible
   - Use built-in language functions
   - Use secure APIs

3. Command Whitelisting
4. Proper Input Sanitization
5. Principle of Least Privilege
