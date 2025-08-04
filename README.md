# Installing and Running the Application

## Prerequisites
- Node.js (v18 or higher)
- MySQL Server
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sharmajidotdev/vul-js-blog-app
   cd js-blog-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   mysql -u root -p < schema.sql
   ```

4. Configure database connection:
   - Copy `config/database.example.js` to `config/database.js`
   - Update the database credentials in `config/database.js`

5. Start the application:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Testing the Vulnerabilities

This application contains several intentionally vulnerable features for educational purposes. Each vulnerability has its own testing guide in the docs folder:

- [SQL Injection](./docs/sql-injection.md)
- [Cross-Site Scripting (XSS)](./docs/xss.md)
- [Open Redirect](./docs/open-redirect.md)
<!-- - [Command Injection](./docs/command-injection.md)
- [Path Traversal](./docs/path-traversal.md)
- [Header Injection](./docs/header-injection.md)
- [Local File Inclusion](./docs/local-file-inclusion.md) -->

## Available Routes

- `/` - Home page
- `/login` - Login page (vulnerable to SQL injection)
- `/register` - User registration
- `/posts` - Blog posts list
- `/vuln/*` - Vulnerability demonstration pages

## Security Warning ⚠️

This application contains intentional security vulnerabilities for educational purposes. DO NOT:
- Deploy this application in a production environment
- Use any of this code in production applications
- Expose this application to the public internet

## Learning Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP Open Redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
