
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',  
  },
  name: String,
  resumeData: {
    content: String,
    skills: [String],
    experience: String,
    education: String,
    score: Number,
    suggestions: [String]
  },
  recommendations: [{
    jobTitle: String,
    company: String,
    matchPercentage: Number,
    description: String
  }],
  interviewQuestions: [String]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);