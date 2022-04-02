const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    minimum: 0,
    required: true,
  },
  /*gender: {
    type: String,
    enum: ["M", "F", "NA"],
    required: false,
  },*/
  password: {
    type: String,
    required: true,
  },
  /*img: {
    type: String,
    required: true,
  },*/
  mobile: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
