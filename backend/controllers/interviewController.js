const { GoogleGenerativeAI } = require('@google/generative-ai');
const Interview = require('../models/Interview');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// System prompt for generating interview questions
const QUESTION_GENERATOR_PROMPT = `
You are an expert technical interviewer with 15+ years of experience hiring for top tech companies.
Generate realistic, challenging interview questions for the specified job role and difficulty level.

Requirements:
1. Mix of technical, behavioral, and situational questions
2. Questions should be specific to the role (not generic)
3. Include a detailed model answer for each question
4. Assign a max score (1-10) based on difficulty
5. Format as valid JSON only

Respond with JSON in this exact format:
{
  "questions": [
    {
      "questionText": "The interview question text",
      "category": "technical|behavioral|situational",
      "modelAnswer": "A strong, detailed model answer that would score 9-10/10",
      "maxScore": 10
    }
  ]
}
`;

// System prompt for evaluating answers
const ANSWER_EVALUATOR_PROMPT = `
You are an expert technical interviewer evaluating a candidate's response.
Provide constructive, detailed feedback and a fair numerical score.

Scoring criteria (1-10):
- 9-10: Exceptional answer, demonstrates deep expertise
- 7-8: Good answer, minor gaps
- 5-6: Adequate, needs improvement
- 3-4: Weak, significant gaps
- 1-2: Very poor or irrelevant

Respond with JSON only:
{
  "score": 7,
  "feedback": "Detailed feedback on what was good and what needs improvement",
  "keyPoints": ["Point the candidate covered well", "Point that was missing"],
  "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
}
`;

// Generate interview questions
const generateInterviewQuestions = async (req, res) => {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GOOGLE_GEMINI_API_KEY not set in .env' });
    }

    const { jobRole, difficulty = 'medium', questionCount = 5 } = req.body;
    const userId = req.user.id;

    if (!jobRole) {
      return res.status(400).json({ message: 'Job role is required' });
    }

    console.log('🎯 Generating interview questions for:', { jobRole, difficulty, questionCount });

    // Get user profile for personalized questions
    const user = await User.findById(userId);
    const userSkills = user?.resumeData?.skills?.join(', ') || 'Not specified';
    const userExperience = user?.resumeData?.experience || 'Not specified';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
${QUESTION_GENERATOR_PROMPT}

Job Role: ${jobRole}
Difficulty Level: ${difficulty}
Number of Questions: ${questionCount}
Candidate Skills: ${userSkills}
Candidate Experience: ${userExperience}

Generate ${questionCount} questions total:
- ${Math.ceil(questionCount * 0.5)} technical questions
- ${Math.floor(questionCount * 0.3)} behavioral questions  
- ${Math.floor(questionCount * 0.2)} situational questions

Make questions realistic for actual ${jobRole} interviews at tech companies.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini Question Generation Complete');

    // Parse JSON response
    let parsedQuestions;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedQuestions = JSON.parse(jsonMatch[0]);
      } else {
        parsedQuestions = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.log('Raw response:', text);
      return res.status(500).json({ message: 'Failed to parse AI response. Please try again.' });
    }

    // Create interview session
    const interview = await Interview.create({
      user: userId,
      jobRole,
      difficulty,
      questions: parsedQuestions.questions.map(q => ({
        questionText: q.questionText,
        category: q.category,
        modelAnswer: q.modelAnswer,
        maxScore: q.maxScore || 10,
        userAnswer: '',
        aiFeedback: '',
        score: 0,
      })),
      status: 'in-progress',
    });

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      jobRole,
      difficulty,
      questionCount: interview.questions.length,
      questions: interview.questions.map(q => ({
        questionText: q.questionText,
        category: q.category,
        maxScore: q.maxScore,
      })),
    });

  } catch (error) {
    console.error('❌ Generate Interview Error:', error.message);
    res.status(500).json({
      message: 'Failed to generate interview questions: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Try again',
    });
  }
};

// Submit an answer
const submitAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { questionIndex, answer } = req.body;
    const userId = req.user.id;

    const interview = await Interview.findOne({ _id: interviewId, user: userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({ message: 'Interview is not in progress' });
    }

    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    // Update the answer
    interview.questions[questionIndex].userAnswer = answer;
    interview.questions[questionIndex].answeredAt = new Date();
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      questionIndex,
    });

  } catch (error) {
    console.error('❌ Submit Answer Error:', error.message);
    res.status(500).json({ message: 'Failed to submit answer: ' + error.message });
  }
};

// Evaluate an answer using AI
const evaluateAnswer = async (req, res) => {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GOOGLE_GEMINI_API_KEY not set in .env' });
    }

    const { interviewId } = req.params;
    const { questionIndex } = req.body;
    const userId = req.user.id;

    const interview = await Interview.findOne({ _id: interviewId, user: userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const question = interview.questions[questionIndex];
    if (!question || !question.userAnswer) {
      return res.status(400).json({ message: 'No answer found for this question' });
    }

    console.log('🔍 Evaluating answer for question:', questionIndex);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
${ANSWER_EVALUATOR_PROMPT}

Job Role: ${interview.jobRole}
Difficulty: ${interview.difficulty}

Question: ${question.questionText}
Category: ${question.category}

Model Answer (what a strong candidate would say):
${question.modelAnswer}

Candidate's Answer:
${question.userAnswer}

Evaluate the candidate's answer compared to the model answer. Be fair but thorough.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini Evaluation Complete');

    // Parse evaluation
    let evaluation;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        evaluation = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('❌ Evaluation Parse Error:', parseError.message);
      evaluation = {
        score: 5,
        feedback: 'Unable to parse detailed feedback. Your answer has been recorded.',
        keyPoints: ['Answer recorded'],
        suggestions: ['Review the model answer for improvement'],
      };
    }

    // Update interview with evaluation
    interview.questions[questionIndex].score = Math.min(Math.max(evaluation.score || 5, 0), question.maxScore);
    interview.questions[questionIndex].aiFeedback = evaluation.feedback || 'No feedback available';
    await interview.save();

    res.status(200).json({
      success: true,
      evaluation: {
        score: interview.questions[questionIndex].score,
        maxScore: question.maxScore,
        feedback: evaluation.feedback,
        keyPoints: evaluation.keyPoints || [],
        suggestions: evaluation.suggestions || [],
        modelAnswer: question.modelAnswer,
      },
    });

  } catch (error) {
    console.error('❌ Evaluate Answer Error:', error.message);
    res.status(500).json({ message: 'Failed to evaluate answer: ' + error.message });
  }
};

// Complete interview and generate summary
const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOne({ _id: interviewId, user: userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Calculate overall score
    const answeredQuestions = interview.questions.filter(q => q.userAnswer);
    const totalScore = answeredQuestions.reduce((sum, q) => sum + q.score, 0);
    const maxPossibleScore = answeredQuestions.reduce((sum, q) => sum + q.maxScore, 0);
    const overallScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Generate summary using AI if API key available
    let summaryFeedback = '';
    let strengths = [];
    let improvements = [];

    if (process.env.GOOGLE_GEMINI_API_KEY && answeredQuestions.length > 0) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const answersSummary = answeredQuestions.map((q, i) =>
          `Q${i + 1} (${q.category}): Score ${q.score}/${q.maxScore}\nFeedback: ${q.aiFeedback}`
        ).join('\n\n');

        const prompt = `
You are a senior career coach summarizing a mock interview performance.

Job Role: ${interview.jobRole}
Difficulty: ${interview.difficulty}
Overall Score: ${overallScore}%

Per-question performance:
${answersSummary}

Provide a brief summary (2-3 sentences), 3 strengths, and 3 areas for improvement.
Respond with JSON only:
{
  "summary": "Brief performance summary",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const summary = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

        summaryFeedback = summary.summary;
        strengths = summary.strengths || [];
        improvements = summary.improvements || [];
      } catch (aiError) {
        console.log('⚠️ AI summary failed, using fallback:', aiError.message);
        summaryFeedback = `You scored ${overallScore}% on this ${interview.difficulty} level ${interview.jobRole} interview.`;
        strengths = ['Completed the interview', 'Gained practice experience'];
        improvements = ['Review model answers', 'Practice more interviews'];
      }
    }

    // Update interview
    interview.overallScore = overallScore;
    interview.summaryFeedback = summaryFeedback;
    interview.strengths = strengths;
    interview.improvements = improvements;
    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    res.status(200).json({
      success: true,
      interview: {
        id: interview._id,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        overallScore,
        summaryFeedback,
        strengths,
        improvements,
        questions: interview.questions.map(q => ({
          questionText: q.questionText,
          category: q.category,
          userAnswer: q.userAnswer,
          modelAnswer: q.modelAnswer,
          score: q.score,
          maxScore: q.maxScore,
          aiFeedback: q.aiFeedback,
        })),
        completedAt: interview.completedAt,
      },
    });

  } catch (error) {
    console.error('❌ Complete Interview Error:', error.message);
    res.status(500).json({ message: 'Failed to complete interview: ' + error.message });
  }
};

// Get interview session
const getInterviewSession = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOne({ _id: interviewId, user: userId });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.status(200).json({
      success: true,
      interview: {
        id: interview._id,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        status: interview.status,
        overallScore: interview.overallScore,
        summaryFeedback: interview.summaryFeedback,
        strengths: interview.strengths,
        improvements: interview.improvements,
        questions: interview.questions.map(q => ({
          questionText: q.questionText,
          category: q.category,
          userAnswer: q.userAnswer,
          modelAnswer: q.modelAnswer,
          score: q.score,
          maxScore: q.maxScore,
          aiFeedback: q.aiFeedback,
          answeredAt: q.answeredAt,
        })),
        createdAt: interview.createdAt,
        completedAt: interview.completedAt,
      },
    });

  } catch (error) {
    console.error('❌ Get Interview Error:', error.message);
    res.status(500).json({ message: 'Failed to get interview: ' + error.message });
  }
};

// Get interview history
const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const interviews = await Interview.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('jobRole difficulty status overallScore createdAt completedAt');

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews: interviews.map(i => ({
        id: i._id,
        jobRole: i.jobRole,
        difficulty: i.difficulty,
        status: i.status,
        overallScore: i.overallScore,
        createdAt: i.createdAt,
        completedAt: i.completedAt,
      })),
    });

  } catch (error) {
    console.error('❌ Get History Error:', error.message);
    res.status(500).json({ message: 'Failed to get interview history: ' + error.message });
  }
};

module.exports = {
  generateInterviewQuestions,
  submitAnswer,
  evaluateAnswer,
  completeInterview,
  getInterviewSession,
  getInterviewHistory,
};

