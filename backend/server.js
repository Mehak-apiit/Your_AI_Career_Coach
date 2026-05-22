
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();


app.use(cors());  
app.use(morgan('dev'));
app.use(express.json());  
app.use('/uploads', express.static('uploads'));  


app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/uploads', express.static('uploads'));
app.use('/api/resume', require('./routes/resume'));
// Remove this line (if you added it)
// const OpenAI = require('openai');

// Keep AI routes
app.use('/api/ai', require('./routes/ai'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/interview', require('./routes/interview'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});