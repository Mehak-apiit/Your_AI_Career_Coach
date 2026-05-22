const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobRole: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
  },
  questions: [{
    questionText: { type: String, required: true },
    category: { type: String, enum: ['technical', 'behavioral', 'situational'] },
    modelAnswer: { type: String },
    maxScore: { type: Number, default: 10 },
    userAnswer: { type: String, default: '' },
    aiFeedback: { type: String, default: '' },
    score: { type: Number, default: 0 },
    answeredAt: { type: Date },
  }],
  overallScore: {
    type: Number,
    default: 0,
  },
  summaryFeedback: {
    type: String,
    default: '',
  },
  strengths: [String],
  improvements: [String],
  completedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);

