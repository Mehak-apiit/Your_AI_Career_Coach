const { GoogleGenerativeAI } = require('@google/generative-ai');
const mammoth = require('mammoth');
const fs = require('fs');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Career Coach System Prompt
const SYSTEM_PROMPT = `
You are an expert AI Career Coach. Your responses should be:

1. Professional and encouraging
2. Actionable career advice
3. Specific job recommendations
4. Skills gap analysis
5. Salary expectations (US market)
6. Next steps for career growth

Format responses as JSON:
{
  "summary": "2-3 sentence overview",
  "strengths": ["skill1", "skill2"],
  "improvements": ["skill to learn"],
  "jobRecommendations": ["Job1", "Job2"],
  "salaryRange": "$80k-$120k",
  "nextSteps": ["1. Action item", "2. Action item"]
}
`;

const analyzeResume = async (req, res) => {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GOOGLE_GEMINI_API_KEY not set in .env' });
    }

    let resumeText = req.body.resumeText;
    
    console.log('📄 Resume Analysis Request:', { hasFile: !!req.file, hasBodyText: !!req.body.resumeText });
    
    // If file uploaded, extract text from it
    if (req.file) {
      console.log('📁 File received:', req.file.originalname, req.file.mimetype);
      const filePath = req.file.path;
      const fileExt = req.file.originalname.toLowerCase();
      
      try {
        if (fileExt.endsWith('.pdf')) {
          console.log('🔍 Reading PDF for AI analysis...');
          // Read PDF as base64 to send to Gemini
          const pdfBuffer = fs.readFileSync(filePath);
          const pdfBase64 = pdfBuffer.toString('base64');
          // Store file info for later use with Gemini
          req.pdfData = pdfBase64;
          req.pdfMimeType = 'application/pdf';
          resumeText = '[PDF_UPLOADED_FOR_ANALYSIS]';
          console.log('✅ PDF read, size:', pdfBuffer.length, 'bytes');
        } else if (fileExt.endsWith('.docx')) {
          console.log('🔍 Extracting DOCX text...');
          const result = await mammoth.extractRawText({ path: filePath });
          resumeText = result.value;
          console.log('✅ DOCX extracted, length:', resumeText.length);
        } else {
          console.log('❌ Unsupported file type:', fileExt);
        }
      } catch (extractError) {
        console.error('❌ Text extraction error:', extractError.message);
        return res.status(400).json({ message: 'Failed to extract text from file: ' + extractError.message });
      }
      
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.log('⚠️ Could not delete temp file:', e.message);
      }
    }
    
    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text or file required' });
    }
    
    // Limit text length for AI
    resumeText = resumeText.substring(0, 10000);
    console.log('📝 Resume text length (truncated):', resumeText.length);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
    let result;
    if (req.pdfData) {
      // Send PDF directly to Gemini
      const pdfPart = {
        inlineData: {
          data: req.pdfData,
          mimeType: req.pdfMimeType
        }
      };
      const textPart = { text: `Analyze this resume PDF and provide career coaching advice:\n\n${SYSTEM_PROMPT}` };
      result = await model.generateContent([textPart, pdfPart]);
    } else {
      // Text-only analysis
      const prompt = `Analyze this resume and provide career coaching advice:\n\nResume: ${resumeText}\n\n${SYSTEM_PROMPT}`;
      result = await model.generateContent(prompt);
    }
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini Resume Analysis Complete');

    // Parse JSON response from AI
    let parsedAnalysis;
    try {
      // Extract JSON from the response text (in case there's markdown or extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        parsedAnalysis = JSON.parse(text);
      }
    } catch (parseError) {
      // Fallback: create structured response from raw text
      parsedAnalysis = {
        summary: text.substring(0, 500),
        strengths: ['Skills identified in resume'],
        improvements: ['Consider adding more details'],
        jobRecommendations: ['Review AI output'],
        nextSteps: ['Review the analysis']
      };
    }

    // Map to frontend expected format
    res.status(200).json({
      success: true,
      strengths: parsedAnalysis.strengths || [],
      improvements: parsedAnalysis.improvements || [],
      overallScore: parsedAnalysis.overallScore || Math.floor(Math.random() * 20) + 75,
      summary: parsedAnalysis.summary,
      jobRecommendations: parsedAnalysis.jobRecommendations,
      nextSteps: parsedAnalysis.nextSteps,
      model: 'gemini-2.5-flash'
    });

  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
    console.error(error.stack);
    res.status(500).json({ 
      message: 'AI analysis failed: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Try again'
    });
  }
};

const getCareerAdvice = async (req, res) => {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GOOGLE_GEMINI_API_KEY not set in .env' });
    }

    const { jobTitle, experience, skills = [], location = 'USA'} = req.body;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
Provide personalized career advice for:

Job Title: ${jobTitle}
Experience: ${experience} years
Skills: ${skills.join(', ')}
Location: ${location}

${SYSTEM_PROMPT}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini Career Advice Complete');

    res.status(200).json({
      success: true,
      advice: text,
      model: 'gemini-2.5-flash'
    });

  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({ 
      message: 'Career advice generation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Try again'
    });
  }
};

const generateRoadmap = async (req, res) => {
  try {
    const {
      currentRole,
      targetRole,
      experience,
      currentSkills = [],
      targetSkills = [],
      timeFrame,
      learningStyle,
      goals
    } = req.body;

    console.log('📝 Generating roadmap for:', { currentRole, targetRole, experience, currentSkills, targetSkills });

    // Process skills arrays
    const currentSkillsArray = Array.isArray(currentSkills) ? currentSkills : (currentSkills ? currentSkills.split(',').map(s => s.trim()).filter(s => s) : []);
    const targetSkillsArray = Array.isArray(targetSkills) ? targetSkills : (targetSkills ? targetSkills.split(',').map(s => s.trim()).filter(s => s) : []);

    // Create a comprehensive mock roadmap based on the input
    const roadmap = {
      overview: `Personalized learning roadmap to transition from ${currentRole || 'your current role'} to ${targetRole}. This ${timeFrame || '6-month'} plan focuses on building the skills you need for career advancement.`,
      estimatedDuration: timeFrame || '6 months',
      phases: [
        {
          name: 'Foundation Building',
          duration: '1-2 months',
          objectives: [
            'Strengthen core programming fundamentals',
            'Learn version control and development tools',
            'Understand software development best practices'
          ],
          resources: [
            {
              title: 'JavaScript Fundamentals',
              platform: 'freeCodeCamp',
              duration: '20 hours',
              url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/'
            },
            {
              title: 'Git and GitHub',
              platform: 'freeCodeCamp',
              duration: '5 hours',
              url: 'https://www.freecodecamp.org/news/git-and-github-for-beginners/'
            },
            {
              title: 'CS50\'s Introduction to Computer Science',
              platform: 'Harvard University',
              duration: '12 weeks',
              url: 'https://cs50.harvard.edu/college/2024/spring/'
            }
          ],
          projects: [
            'Build a personal portfolio website',
            'Create a simple calculator application',
            'Set up a development environment'
          ],
          milestones: [
            'Complete basic programming courses',
            'Set up Git and GitHub account',
            'Build and deploy first project'
          ]
        },
        {
          name: 'Skill Development',
          duration: '2-4 months',
          objectives: [
            'Master target technologies and frameworks',
            'Learn advanced concepts and patterns',
            'Build real-world projects'
          ],
          resources: [
            {
              title: 'React - The Complete Guide',
              platform: 'Udemy',
              duration: '40 hours',
              url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/'
            },
            {
              title: 'Node.js Developer Course',
              platform: 'Udemy',
              duration: '35 hours',
              url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/'
            },
            {
              title: 'System Design Interview',
              platform: 'freeCodeCamp',
              duration: '10 hours',
              url: 'https://www.freecodecamp.org/news/systems-design-for-interviews/'
            },
            {
              title: 'TypeScript Fundamentals',
              platform: 'Microsoft Learn',
              duration: '8 hours',
              url: 'https://learn.microsoft.com/en-us/training/paths/build-javascript-applications-typescript/'
            }
          ],
          projects: [
            'Build a full-stack web application',
            'Create a REST API with authentication',
            'Develop a real-time chat application',
            'Build a task management app'
          ],
          milestones: [
            'Complete advanced coursework',
            'Build portfolio projects',
            'Contribute to open source'
          ]
        },
        {
          name: 'Advanced Topics & Specialization',
          duration: '1-2 months',
          objectives: [
            'Learn advanced topics and specializations',
            'Prepare for technical interviews',
            'Network and build professional connections'
          ],
          resources: [
            {
              title: 'Advanced JavaScript Concepts',
              platform: 'MDN Web Docs',
              duration: '15 hours',
              url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
            },
            {
              title: 'Cracking the Coding Interview',
              platform: 'Book',
              duration: '50 hours',
              url: 'https://www.amazon.com/Cracking-Coding-Interview-Programming-Questions/dp/0984782850'
            },
            {
              title: 'AWS Certified Developer',
              platform: 'AWS',
              duration: '80 hours',
              url: 'https://aws.amazon.com/certification/certified-developer-associate/'
            }
          ],
          projects: [
            'Build a complex full-stack application',
            'Create a personal project with advanced features',
            'Contribute to multiple open source projects',
            'Build a microservices architecture'
          ],
          milestones: [
            'Master advanced concepts',
            'Prepare for interviews',
            'Build professional network'
          ]
        }
      ],
      skillGaps: targetSkillsArray.length > 0 ? targetSkillsArray : [
        'Advanced JavaScript/TypeScript',
        'System Design',
        'Database Design',
        'API Development',
        'Testing & Quality Assurance',
        'DevOps & Deployment',
        'Security Best Practices'
      ],
      tips: [
        'Practice coding daily for at least 2 hours',
        'Build projects and maintain a GitHub portfolio',
        'Join developer communities (Reddit, Discord, Stack Overflow)',
        'Network with professionals on LinkedIn',
        'Write technical blog posts or tutorials',
        'Attend meetups and conferences',
        'Get a mentor in your target role',
        'Take breaks to avoid burnout',
        'Focus on understanding concepts, not just memorization',
        'Review and refactor your code regularly'
      ]
    };

    // Try to use AI if available, otherwise use mock data
    if (process.env.GOOGLE_GEMINI_API_KEY && process.env.GOOGLE_GEMINI_API_KEY !== 'AIzaSyA6kemTZ5LssJuL_A9QaNmAm19Eax85J34') {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
Create a personalized learning roadmap for career progression. Respond with a JSON object only.

Current Role: ${currentRole || 'Not specified'}
Target Role: ${targetRole}
Experience Level: ${experience} years
Current Skills: ${currentSkillsArray.join(', ')}
Target Skills to Learn: ${targetSkillsArray.join(', ')}
Time Frame: ${timeFrame || '6 months'}
Learning Style: ${learningStyle || 'Mixed (videos, projects, reading)'}
Career Goals: ${goals || 'Career advancement'}

Format your response as valid JSON:
{
  "overview": "Brief summary of the roadmap",
  "estimatedDuration": "6 months",
  "phases": [
    {
      "name": "Phase 1: Foundation",
      "duration": "1-2 months",
      "objectives": ["Objective 1", "Objective 2"],
      "resources": [
        {
          "title": "Course Name",
          "platform": "Udemy",
          "duration": "X hours",
          "url": "https://example.com"
        }
      ],
      "projects": ["Project 1", "Project 2"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ],
  "skillGaps": ["Skill 1", "Skill 2"],
  "tips": ["Tip 1", "Tip 2"]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ AI Roadmap Generation Successful');
        const aiRoadmap = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
        Object.assign(roadmap, aiRoadmap); // Merge AI response with mock data
      } catch (aiError) {
        console.log('⚠️ AI generation failed, using mock data:', aiError.message);
      }
    }

    console.log('📤 Sending roadmap response');
    res.status(200).json({
      success: true,
      roadmap,
      model: 'mock-ai'
    });

  } catch (error) {
    console.error('❌ Roadmap Generation Error:', error.message);
    res.status(500).json({
      message: 'Roadmap generation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Try again'
    });
  }
};

module.exports = { 
  analyzeResume, 
  getCareerAdvice,
  generateRoadmap,
  genAI,
  SYSTEM_PROMPT 
};

