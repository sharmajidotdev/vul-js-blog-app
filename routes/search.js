const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Vulnerable search route
router.get('/search', (req, res) => {
    const searchQuery = req.query.q || '';
    
    // Vulnerable: Direct string concatenation in SQL query
    const query = `SELECT * FROM posts WHERE title LIKE '%${searchQuery}%' OR content LIKE '%${searchQuery}%'`;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Search error:', err);
            return res.status(500).send('Error performing search');
        }
        
        // If no results, initialize as empty array
        const posts = results || [];
        
        // Render the EJS template with the search results
        res.render('search', {
            query: searchQuery,
            results: posts,
            title: 'Search Results'
        });
    });
});

module.exports = router;