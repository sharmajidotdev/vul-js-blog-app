const db = require('../config/database');

module.exports = {
  // Vulnerable SQL query - DO NOT USE IN PRODUCTION!
  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      // Deliberately vulnerable SQL query for demonstration
      const query = `SELECT * FROM users WHERE username = '${username}'`;
      db.query(query, (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
    
    /* SECURE CODE - Uncomment this block and comment out the above block to prevent SQL injection*/
    // return new Promise((resolve, reject) => {
    //   // Using parameterized query to prevent SQL injection
    //   const secureQuery = 'SELECT * FROM users WHERE username = ?';
    //   db.query(secureQuery, [username], (err, results) => {
    //     if (err) reject(err);
    //     resolve(results[0]);
    //   });
    // });
    
  },
  
  addUser: (user) => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(query, [user.username, user.password], (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
};