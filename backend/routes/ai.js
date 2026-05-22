const express = require('express');
const { protect } = require('../middleware/auth');
const { analyzeResume, getCareerAdvice, generateRoadmap } = require('../controllers/aiController');
const generateText = require('../controllers/Test');
const upload = require('../middleware/multer');

const router = express.Router();

// Protect all AI routes
//router.use(protect);

// Resume analysis - accepts file upload
router.post('/resume-analysis', upload.single('resume'), analyzeResume);
//router.post('/resume-analysis',generateText);

// Career advice
router.post('/career-advice', getCareerAdvice);

// Roadmap generator
router.post('/generate-roadmap', generateRoadmap);

module.exports = router;