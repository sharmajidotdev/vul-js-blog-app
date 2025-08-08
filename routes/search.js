const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Vulnerable search route
router.get('/search', (req, res) => {
    const searchQuery = req.query.q || '';

    // LEARN HERE: Vulnerable code (SQL Injection)
    // const query = `SELECT * FROM posts WHERE title LIKE '%${searchQuery}%' OR content LIKE '%${searchQuery}%'`;
    // db.query(query, (err, results) => { ... });

    // SECURE CODE: Use parameterized queries to prevent SQL injection
    // This method ensures user input is treated as data, not executable SQL
    const query = `SELECT * FROM posts WHERE title LIKE ? OR content LIKE ?`;
    const param = `%${searchQuery}%`;
    db.query(query, [param, param], (err, results) => {
        if (err) {
            console.error('Search error:', err);
            return res.status(500).send('Error performing search');
        }
        const posts = results || [];
        res.render('search', {
            query: searchQuery,
            results: posts,
            title: 'Search Results'
        });
    });
});

module.exports = router;