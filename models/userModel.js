const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: [true, 'This user exists'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide a valid contact number'],
    unique: [true, 'This user exists']
  },
  houseNumber: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'vendor', 'admin'],
    default: 'user'
  },
  coin: {
    type: Number,
    default: 0
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
