# Your_AI_Career_Coach (AI Career Coach)

Full-stack app that helps users:
- Upload a resume (PDF/DOCX) and receive AI career coaching feedback
- Generate career advice and learning roadmap
- Chat with an AI career mentor
- Practice mock technical interviews with AI-generated questions and scoring
- (Admin) manage users + view analytics

---

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- AI: Google Gemini via `@google/generative-ai`
- File uploads: `multer`

### Frontend
- React (Create React App)
- React Router
- TailwindCSS
- Axios
- UI: MUI icons / Lucide / custom components

---

## Folder Structure

```text
LAKSH_AI/
  README.md
  TODO.md
  backend/
    server.js
    package.json
    controllers/
      aiController.js
      authController.js
      chatController.js
      interviewController.js
      profileController.js
      adminController.js
      resumeController.js
      Test.js
    routes/
      auth.js
      profile.js
      resume.js
      ai.js
      chat.js
      admin.js
      interview.js
    middleware/
      auth.js
      admin.js
      multer.js
    models/
      User.js
      Interview.js
      Chat.js
    uploads/
      (uploaded resume files)
  frontend/
    package.json
    src/
      lib/api.js
      context/AuthContext.jsx
      App.jsx
      pages/
        Home.jsx
        auth/
        dashboard/
          Dashboard.jsx
          ResumeAnalyzer.jsx
          RoadmapGenerator.jsx
          Chat.jsx
          Profile.jsx
          MockInterview.jsx
        admin/
          AdminDashboard.jsx
      components/
      styles/
```

---

## Environment Variables (.env)

Create a `.env` file in **backend/**.

### Required
```bash
# Backend
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Google Gemini
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

> If `GOOGLE_GEMINI_API_KEY` is missing, some AI endpoints will return an error (or fall back to mock data for roadmap generation).

---

## Authentication

Backend uses JWT.

### Header
- `Authorization: Bearer <token>`

Backend protection:
- `protect` middleware sets `req.user`.
- Admin routes additionally require `req.user.role === 'admin'`.

---

## Backend API (Endpoints)

Base URL:
- `http://localhost:5000/api`

> All protected routes require JWT.

### 1) Auth

#### Register
`POST /api/auth/register`

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "role": "user" 
}
```

**Response**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "<userId>",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### Login
`POST /api/auth/login`

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "<userId>",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

### 2) Profile

`GET /api/profile`  *(protected)*

**Response**
```json
{
  "_id": "<userId>",
  "email": "user@example.com",
  "role": "user",
  "name": "User Name",
  "resumeData": { ... },
  "recommendations": [ ... ],
  "interviewQuestions": [ ... ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

`PUT /api/profile` *(protected)*

**Request (example)**
```json
{
  "name": "New Name",
  "resumeData": {
    "skills": ["JavaScript", "React"],
    "experience": "2 years",
    "education": "B.Tech"
  }
}
```

**Response**
Returns the updated user (password excluded).

---

### 3) Resume Upload

`POST /api/resume/upload` *(protected, multipart)*

**Request**
- Form field name: `resume`

**cURL example**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "resume=@/path/to/resume.pdf" \
  http://localhost:5000/api/resume/upload
```

**Response**
```json
{
  "message": "Resume uploaded successfully",
  "resumeUrl": "http://localhost:5000/uploads/<fileName>"
}
```

---

### 4) AI

Base path: `/api/ai`

#### 4.1 Resume Analysis
`POST /api/ai/resume-analysis` *(protected, multipart)*

Frontend also calls this endpoint.

**Request**
- Form field name: `resume`

**cURL example**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "resume=@/path/to/resume.docx" \
  http://localhost:5000/api/ai/resume-analysis
```

**Response**
```json
{
  "success": true,
  "strengths": ["..."],
  "improvements": ["..."],
  "overallScore": 87,
  "summary": "...",
  "jobRecommendations": ["..."],
  "nextSteps": ["..."],
  "model": "gemini-2.5-flash"
}
```

#### 4.2 Career Advice
`POST /api/ai/career-advice` *(protected)*

**Request**
```json
{
  "jobTitle": "Software Engineer",
  "experience": 2,
  "skills": ["JavaScript", "Node.js"],
  "location": "USA"
}
```

**Response**
```json
{
  "success": true,
  "advice": "<AI generated text>",
  "model": "gemini-2.5-flash"
}
```

#### 4.3 Generate Roadmap
`POST /api/ai/generate-roadmap` *(protected)*

**Request**
```json
{
  "currentRole": "Junior Developer",
  "targetRole": "Backend Developer",
  "experience": 2,
  "currentSkills": ["Node.js", "MongoDB"],
  "targetSkills": ["System Design", "Testing"],
  "timeFrame": "6 months",
  "learningStyle": "Mixed (videos, projects, reading)",
  "goals": "Career growth"
}
```

**Response**
```json
{
  "success": true,
  "roadmap": {
    "overview": "...",
    "estimatedDuration": "...",
    "phases": [ ... ],
    "skillGaps": [ ... ],
    "tips": [ ... ]
  },
  "model": "mock-ai"
}
```

> When Gemini API key is present, it attempts AI generation; otherwise it uses mock roadmap.

---

### 5) Chat

Base path: `/api/chat`

`GET /api/chat` *(protected)*

**Response**
```json
[
  {
    "_id": "<chatId>",
    "user": "<userId>",
    "sessionId": "<sessionId>",
    "messages": [
      { "role": "user", "content": "...", "timestamp": "..." },
      { "role": "assistant", "content": "...", "timestamp": "..." }
    ]
  }
]
```

`POST /api/chat/new` *(protected)*

**Request**
```json
{
  "message": "How can I prepare for backend interviews?"
}
```

**Response**
Chat document with updated messages array.

---

### 6) Admin

Base path: `/api/admin`

> Admin middleware checks `user.role === 'admin'`.

`GET /api/admin/users` *(admin, protected)*

**Response**
```json
{
  "success": true,
  "count": 10,
  "data": [ {"_id":"...","email":"..."} ]
}
```

`DELETE /api/admin/users/:id` *(admin, protected)*

**Response**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

`GET /api/admin/analytics` *(admin, protected)*

**Response**
```json
{
  "success": true,
  "analytics": {
    "totalUsers": 123,
    "activeUsers": 45,
    "completionRate": 37,
    "recentUsers": 10,
    "lastMonthSignups": 10
  }
}
```

---

### 7) Mock Interview

Base path: `/api/interview`

All interview routes are protected.

#### 7.1 Generate Interview
`POST /api/interview/generate` *(protected)*

**Request**
```json
{
  "jobRole": "Software Engineer",
  "difficulty": "medium",   
  "questionCount": 5
}
```

**Response**
```json
{
  "success": true,
  "interviewId": "<interviewId>",
  "jobRole": "Software Engineer",
  "difficulty": "medium",
  "questionCount": 5,
  "questions": [
    { "questionText": "...", "category": "technical", "maxScore": 10 }
  ]
}
```

> The stored interview includes model answers and scoring metadata.

#### 7.2 Submit Answer
`POST /api/interview/:interviewId/answer` *(protected)*

**Request**
```json
{
  "questionIndex": 0,
  "answer": "My answer text..."
}
```

**Response**
```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "questionIndex": 0
}
```

#### 7.3 Evaluate Answer
`POST /api/interview/:interviewId/evaluate` *(protected)*

**Request**
```json
{
  "questionIndex": 0
}
```

**Response**
```json
{
  "success": true,
  "evaluation": {
    "score": 7,
    "maxScore": 10,
    "feedback": "Detailed feedback...",
    "keyPoints": ["..."],
    "suggestions": ["..."] ,
    "modelAnswer": "..."
  }
}
```

#### 7.4 Complete Interview
`POST /api/interview/:interviewId/complete` *(protected)*

**Response**
```json
{
  "success": true,
  "interview": {
    "id": "<interviewId>",
    "jobRole": "Software Engineer",
    "difficulty": "medium",
    "overallScore": 72,
    "summaryFeedback": "...",
    "strengths": ["..."],
    "improvements": ["..."],
    "questions": [
      {
        "questionText": "...",
        "category": "technical",
        "userAnswer": "...",
        "modelAnswer": "...",
        "score": 7,
        "maxScore": 10,
        "aiFeedback": "..."
      }
    ],
    "completedAt": "..."
  }
}
```

#### 7.5 Get a Session
`GET /api/interview/:interviewId` *(protected)*

**Response**
```json
{
  "success": true,
  "interview": {
    "id": "<interviewId>",
    "jobRole": "Software Engineer",
    "difficulty": "medium",
    "status": "in-progress|completed|abandoned",
    "overallScore": 72,
    "questions": [ ... ]
  }
}
```

#### 7.6 Interview History
`GET /api/interview` *(protected)*

**Response**
```json
{
  "success": true,
  "count": 3,
  "interviews": [
    {
      "id": "<interviewId>",
      "jobRole": "Software Engineer",
      "difficulty": "medium",
      "status": "completed",
      "overallScore": 72,
      "createdAt": "...",
      "completedAt": "..."
    }
  ]
}
```

---

## Data Models (High-level)

### User
- `email`, `password`, `role` (`user|admin`)
- `name`
- `resumeData`: `content`, `skills[]`, `experience`, `education`, `score`, `suggestions[]`
- `recommendations[]`: job matching data

### Interview
- `user` (reference to User)
- `jobRole`, `difficulty` (`easy|medium|hard`)
- `status` (`in-progress|completed|abandoned`)
- `questions[]` containing:
  - `questionText`, `category`, `modelAnswer`, `maxScore`
  - `userAnswer`, `aiFeedback`, `score`, `answeredAt`
- `overallScore`, `summaryFeedback`, `strengths[]`, `improvements[]`

### Chat
- `user`
- `messages[]`: `{role: 'user'|'assistant', content, timestamp}`
- `sessionId`

---

## Frontend API Client

Frontend uses `frontend/src/lib/api.js`.

Base URL:
- `http://localhost:5000/api`

It automatically attaches JWT:
- `Authorization: Bearer <token>` from `localStorage.token`

Key client objects:
- `authAPI` (register/login)
- `profileAPI` (get/update)
- `resumeAPI` (upload)
- `aiAPI` (resume-analysis/career-advice/generate-roadmap)
- `chatAPI` (history/new)
- `interviewAPI` (generate/answer/evaluate/complete/session/history)

---

## Running the Project

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Backend starts on `http://localhost:5000` (default).

### 2) Frontend

```bash
cd frontend
npm install
npm start
```

Frontend typically runs on `http://localhost:3000`.

---

## Notes / Known Implementation Details

- Resume uploads are stored under `backend/uploads/` via `multer`.
- Resume analysis and interview generation/evaluation call Gemini (`gemini-2.5-flash`).
- Some AI endpoints attempt JSON parsing from the model output; if parsing fails, the backend falls back to safer structured output.

---

## References
- Gemini model used in controllers: `gemini-2.5-flash`

