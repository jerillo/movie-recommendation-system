const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Search page
router.get('/', (req, res) => {
    res.render('search');
});

// Show register form
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle sign up logic
router.post('/register', (req, res) => {
    const newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', 'Welcome to Movie Journal, ' + user.username);
            res.redirect('/')
        });
    }); 
});

// Show login form
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle login logic
router.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/ratings',
        failureRedirect: '/login',
        failureFlash: true,
    }), (req, res) => {
    res.send('login');
});

// Logic route
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged out successfully');
    res.redirect('/');
});

module.exports = router;
