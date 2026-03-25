const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {type: String, required:true},
    email: {type: String, required:true, unique:true},
    password: {type: String, required:true},


  bio: { type: String, default: '' },
  freelanceCategory: { type: String, default: '' },

  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

module.exports = userModel;