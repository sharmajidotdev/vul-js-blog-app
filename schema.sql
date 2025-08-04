CREATE DATABASE IF NOT EXISTS blogapp;
USE blogapp;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    post_id INT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert Users
INSERT INTO users (username, password) VALUES
('admin', 'admin123'),           -- Admin user
('alice', 'securepass123'),     -- Security researcher
('bob', 'password123'),         -- Regular blogger
('charlie', 'testing123'),      -- Security tester
('dave', 'letmein123');         -- Content creator

-- Insert Blog Posts
INSERT INTO posts (title, content, user_id, created_at) VALUES
('Welcome to Our Security Blog', 'This is a demonstration blog for testing various security vulnerabilities...', 1, NOW() - INTERVAL 20 DAY),
('Understanding XSS Attacks', 'Cross-site scripting (XSS) is a type of security vulnerability...', 2, NOW() - INTERVAL 19 DAY),
('SQL Injection Basics', 'SQL injection is one of the most common web security vulnerabilities...', 2, NOW() - INTERVAL 18 DAY),
('Web Security Best Practices', 'Here are some essential security practices every developer should follow...', 1, NOW() - INTERVAL 17 DAY),
('CSRF Protection Guide', 'Cross-Site Request Forgery attacks can be prevented by...', 4, NOW() - INTERVAL 16 DAY),
('Security Headers Explained', 'Understanding security headers and their importance in web security...', 3, NOW() - INTERVAL 15 DAY),
('Password Storage Best Practices', 'How to properly hash and salt passwords in your application...', 2, NOW() - INTERVAL 14 DAY),
('API Security Guidelines', 'Securing your APIs is crucial in modern web applications...', 5, NOW() - INTERVAL 13 DAY),
('Authentication vs Authorization', 'Understanding the difference between authentication and authorization...', 4, NOW() - INTERVAL 12 DAY),
('Session Management Security', 'Best practices for secure session management in web apps...', 1, NOW() - INTERVAL 11 DAY),
('Input Validation Techniques', 'Proper input validation is your first line of defense...', 3, NOW() - INTERVAL 10 DAY),
('Security Testing Tools', 'A review of popular security testing tools and frameworks...', 2, NOW() - INTERVAL 9 DAY),
('OWASP Top 10 Overview', 'Understanding the most critical web application security risks...', 5, NOW() - INTERVAL 8 DAY),
('Secure Code Review Tips', 'What to look for when conducting security code reviews...', 4, NOW() - INTERVAL 7 DAY),
('Database Security Guide', 'Protecting your database from common security threats...', 1, NOW() - INTERVAL 6 DAY),
('Web Security Headers', 'Implementation guide for security headers in web applications...', 3, NOW() - INTERVAL 5 DAY),
('Secure File Upload Tips', 'How to handle file uploads securely in your application...', 2, NOW() - INTERVAL 4 DAY),
('SSL/TLS Best Practices', 'Implementing and maintaining secure SSL/TLS configuration...', 5, NOW() - INTERVAL 3 DAY),
('Security Logging Guide', 'Best practices for security logging and monitoring...', 4, NOW() - INTERVAL 2 DAY),
('Vulnerability Assessment', 'How to conduct thorough vulnerability assessments...', 1, NOW() - INTERVAL 1 DAY);

-- Insert two comments for each post
INSERT INTO comments (content, post_id, user_id) VALUES
-- Comments for post 1
('Great introduction to security concepts!', 1, 2),
('This blog will be very helpful for beginners.', 1, 3),

-- Comments for post 2 (XSS Attacks)
('This helped me understand XSS better.', 2, 3),
('Could you add more examples of DOM-based XSS?', 2, 4),

-- Comments for post 3 (SQL Injection)
('Very useful information about SQL injection.', 3, 4),
('I found a typo in the prepared statements section.', 3, 5),

-- Comments for post 4 (Security Best Practices)
('Would love to see more detailed examples.', 4, 5),
('Great checklist for security implementations!', 4, 1),

-- Comments for post 5 (CSRF Protection)
('Looking forward to more security content.', 5, 1),
('The CSRF token explanation was very clear.', 5, 2),

-- Comments for post 6 (Security Headers)
('HTTP Security Headers are crucial indeed.', 6, 2),
('Could you explain CSP in more detail?', 6, 3),

-- Comments for post 7 (Password Storage)
('Bcrypt vs Argon2 comparison was helpful.', 7, 3),
('What about using Pepper with salt?', 7, 4),

-- Comments for post 8 (API Security)
('JWT best practices section was excellent.', 8, 4),
('Please add OAuth2.0 security considerations.', 8, 5),

-- Comments for post 9 (Authentication)
('The difference is now crystal clear!', 9, 5),
('Good explanation of role-based access.', 9, 1),

-- Comments for post 10 (Session Management)
('Session fixation section was enlightening.', 10, 1),
('How about covering session timeouts?', 10, 2),

-- Comments for post 11 (Input Validation)
('Regex examples were very practical.', 11, 2),
('Add more about sanitization vs validation?', 11, 3),

-- Comments for post 12 (Security Testing)
('ZAP tutorial was very helpful.', 12, 3),
('Could you compare with Burp Suite?', 12, 4),

-- Comments for post 13 (OWASP Top 10)
('Great overview of current threats.', 13, 4),
('Looking forward to detailed writeups.', 13, 5),

-- Comments for post 14 (Code Review)
('The checklist is very comprehensive.', 14, 5),
('Adding automated tools section would help.', 14, 1),

-- Comments for post 15 (Database Security)
('Connection pooling section was informative.', 15, 1),
('More on MongoDB security would be nice.', 15, 2),

-- Comments for post 16 (Web Security Headers)
('HSTS explanation was very clear.', 16, 2),
('What about Feature-Policy header?', 16, 3),

-- Comments for post 17 (File Upload)
('File type verification tips helped.', 17, 3),
('Add section about virus scanning?', 17, 4),

-- Comments for post 18 (SSL/TLS)
('Perfect timing, needed this for work.', 18, 4),
('Certificate pinning section was great.', 18, 5),

-- Comments for post 19 (Security Logging)
('ELK stack integration would be nice.', 19, 5),
('Good coverage of essential logs.', 19, 1),

-- Comments for post 20 (Vulnerability Assessment)
('The methodology is well structured.', 20, 1),
('Tools comparison was very helpful.', 20, 2);
