const mongoose = require("mongoose");
const Chat = require('../models/Chat');
const { genAI, SYSTEM_PROMPT } = require('./aiController');

const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const newChat = async (req, res) => {
  try {
    const { message } = req.body;
    const sessionId = new mongoose.Types.ObjectId().toString();
    
    const chat = await Chat.create({
      user: req.user.id,
      messages: [{ role: 'user', content: message }],
      sessionId,
    });

    // Generate AI response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
You are a helpful career assistant. Respond to this user message:

User: ${message}

${SYSTEM_PROMPT}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    chat.messages.push({
      role: 'assistant',
      content: text,
    });
    await chat.save();

    console.log('✅ Gemini Chat Response Complete', { response: text });
    res.json(chat);
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatHistory, newChat };

