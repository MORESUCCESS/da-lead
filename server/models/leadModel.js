const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  website: { type: String },
  socialHandle: { type: String },
  contactEmail: { type: String },
  status: { type: String, enum: ['not_contacted', 'contacted', 'replied', 'closed'], default: 'not_contacted' },
  opportunityScore: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  whyTheyNeedYou: { type: String },
  problemDescription: {type: String},
  pitchTemplate: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);