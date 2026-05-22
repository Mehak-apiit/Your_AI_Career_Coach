const express = require('express');
const { protect } = require('../middleware/auth');
const {
  generateInterviewQuestions,
  submitAnswer,
  evaluateAnswer,
  completeInterview,
  getInterviewSession,
  getInterviewHistory,
} = require('../controllers/interviewController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Generate new interview questions
router.post('/generate', generateInterviewQuestions);

// Submit an answer for a question
router.post('/:interviewId/answer', submitAnswer);

// Evaluate an answer using AI
router.post('/:interviewId/evaluate', evaluateAnswer);

// Complete the interview and get summary
router.post('/:interviewId/complete', completeInterview);

// Get a specific interview session
router.get('/:interviewId', getInterviewSession);

// Get interview history
router.get('/', getInterviewHistory);

module.exports = router;

