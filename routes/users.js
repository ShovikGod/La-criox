const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const Otp = require('../models/Otp')
const { forwardAuthenticated } = require('../config/auth');
let localE="";

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Forgot Password Page
router.get('/forgot-password', (req, res) => res.render('forgotPassword'));

// New Password
router.get('/new-password', (req, res) => res.render('newPassword'));

// Register
router.post('/register', (req, res) => {
  const { name, email, address, age, password, password2, mobile, sq, sans } = req.body;
  let errors = [];
  if (!name || !email || !address || !age || !password || !password2 || !mobile || !sq || !sans) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      address,
      age,
      password,
      password2,
      mobile,
      sq,
      sans
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          address,
          age,
          email,
          password,
          password2,
          mobile,
          sq,
          sans
        });
      } else {
        const newUser = new User({
          name,
          email,
          address,
          age,
          password,
          mobile,
          sq,
          sans
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email, sq, sans } = req.body;
  errors=[];
  if (!email || !sq || !sans) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (errors.length > 0) {
    res.render('forgotPassword', {
      errors,
      email,
      sq,
      sans
    });
  } 
  else {
    User.findOne({ email: email, sq: sq, sans: sans }).then(user => {
      if (!user) {
        errors.push({ msg: 'Credentials mismatch' });
        res.render('forgotPassword', {
          errors, 
          email,
          sq,
          sans
        });
      } 
      else {
        localE=email;
        res.redirect('/users/new-password');
      }
    })
  }
});

// New Password
router.post('/new-password', (req, res) => {
  const { password, password2 } = req.body;
  let errors = [];
  if (!password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('newPassword', {
      errors,
      localE,
      password,
      password2,
    });
  } 
  else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        User.updateOne({ email: localE }, { password: hash }).then(user => {
          if (user) { 
            req.flash(
              'success_msg',
              'Your password has been changed'
            );
          } 
          else {
            errors.push('Error');
          }
        })
        .catch(err => console.log(err));
      });
    });
  }
  req.flash('success_msg', 'Your password has been successfully changed');
  res.redirect('/users/login');
});

module.exports = router;