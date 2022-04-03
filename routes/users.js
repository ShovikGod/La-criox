const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const Otp = require('../models/Otp')
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Forgot Password Page
router.get('/forgot-password', (req, res) => res.render('forgotPassword'));

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





// // Forgot Password
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
        errors.push({ msg: 'Wrong credentials' });
        res.render('forgotPassword', {
          errors, 
          email,
          sq,
          sans
        });
      } 
      else {
        res.render('newPassword');
      }
    })
  };
}

// forgot password
// const emailSend= async(req, res)=>{
//   let data= await User.findOne({email: req.body.email});
//   const responseType={};
//   if(data){
//     let otpcode= Math.floor((Math.random()*10000)+1);
//     let otpData= new Otp({
//       email:req.body.email,
//       code: otpcode,
//       expireIn: new Date().getTime + 300*1000
//     })
//     let otpResponse= await otpData.save();
//     responseType.statusText= 'Success';
//     responseType.message= 'Please check your Email';
//   }else{
//     responseType.statusText= 'error';
//     responseType.message= 'Email ID does not exist';
//   }
//   res.status(200).json(responseType);
// }

//change password
// const changePassword = async(req, res)=>{
//   let data=  await Otp.find({email: req.body.email, code: req.body.otpcode});
//   const response={};
//   if(data){
//     let currentTime = new Date().getTime();
//     let diff= data.expireIn - currentTime;
//     if(diff<0){
//       response.message= 'Token Expired';
//       response.statusText='error'
//     }else{
//       let user= await User.findOne({email: req.body.email});
//       user.password= req.body.password;
//       user.save();
//       response.message= 'Password changed Successfully';
//       response.statusText='Success'
//     }
//   }else{
//     response.message= 'Invalid OTP';
//       response.statusText='error'
//   }
//   res.status(200).json(responseType);
// }

//nodemailer
// const mailer= (email,otp)=>{
//   var nodemailer= require('nodemailer');
//   var transporter= nodemailer.createTransport({
//     service: 'gmail',
//     port: 587,
//     secure: false,
//     auth: {
//       user: 'lacroixtechnologies@gmail.com',
//       pass: 'fifabrazil'
//     }
//   });

//   var mailOptions={
//     from: 'lacroixtechnologies@gmail.com',
//     to: email,
//     subject: 'Sending Email using node.js',
//     text: 'Thank you sir!'
//   };

//   transporter.sendMail(mailOptions, function(error, info){
//     if(error){
//       console.log(error);
//     }else{
//       console.log('Email sent: '+ info.response);
//     }
//   });
// }

module.exports = router;
