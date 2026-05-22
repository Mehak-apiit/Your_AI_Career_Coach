const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multer');
const { uploadResume } = require('../controllers/resumeController');

const router = express.Router();

router.use(protect);
router.post('/upload', upload.single('resume'), uploadResume);

module.exports = router;