// src/website/server.js
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure session middleware
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));

// Configure Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Configure Discord strategy
passport.use(new DiscordStrategy({
  clientID: 'YOUR_DISCORD_CLIENT_ID',
  clientSecret: 'YOUR_DISCORD_CLIENT_SECRET',
  callbackURL: 'http://localhost:3000/auth/discord/callback',
  scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
  // Handle the authenticated user
  // You can store the user information in a database or perform additional actions
  return done(null, profile);
}));

// Serve the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Login route
app.get('/auth/discord', passport.authenticate('discord'));

// Callback route
app.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to the dashboard or do something else
    res.redirect('/dashboard');
  }
);

// Protected route for the dashboard
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    // User is authenticated, render the dashboard
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    // User is not authenticated, redirect to the login page
    res.redirect('/');
  }
});

// Protected route for the subscription page
app.get('/subscribe', (req, res) => {
  if (req.isAuthenticated()) {
    // User is authenticated, render the subscription page
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    // User is not authenticated, redirect to the login page
    res.redirect('/');
  }
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Website is running on port ${port}`);
});

module.exports = app;
