import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Loader2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  AlertCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  BrainCircuit,
  Target,
  TrendingUp,
  Award,
  X,
  History,
} from 'lucide-react';

import { interviewAPI } from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

// Timer hook
const useTimer = (initialSeconds = 0, isRunning = false) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);
  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  return { seconds, formatted: format(seconds), reset: () => setSeconds(0) };
};

const PHASES = {
  SETUP: 'setup',
  INTERVIEW: 'interview',
  EVALUATING: 'evaluating',
  RESULTS: 'results',
  HISTORY: 'history',
};

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'bg-green-500', desc: 'Foundational questions' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500', desc: 'Standard interview level' },
  { value: 'hard', label: 'Hard', color: 'bg-red-500', desc: 'Senior/Staff level' },
];

const JOB_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'UI/UX Designer',
  'QA Engineer',
  'Site Reliability Engineer',
  'Cloud Architect',
  'Cybersecurity Analyst',
  'Mobile Developer',
  'Technical Lead',
];

const CATEGORY_ICONS = {
  technical: BrainCircuit,
  behavioral: Target,
  situational: TrendingUp,
};

const CATEGORY_COLORS = {
  technical: 'bg-blue-100 text-blue-700 border-blue-200',
  behavioral: 'bg-purple-100 text-purple-700 border-purple-200',
  situational: 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function MockInterview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const answerRef = useRef(null);

  const timer = useTimer(0, phase === PHASES.INTERVIEW);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await interviewAPI.getHistory();
      if (data.success) setHistory(data.interviews || []);
    } catch (err) {
      console.log('History load failed:', err);
    }
  };

  // Start new interview
  const startInterview = async () => {
    if (!jobRole) {
      setError('Please select a job role');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await interviewAPI.generate({
        jobRole,
        difficulty,
        questionCount: parseInt(questionCount),
      });
      if (data.success) {
        setInterviewId(data.interviewId);
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setAnswer('');
        setPhase(PHASES.INTERVIEW);
        timer.reset();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit current answer and evaluate
  const submitCurrentAnswer = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer before continuing');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Submit answer
      await interviewAPI.submitAnswer(interviewId, {
        questionIndex: currentQuestionIndex,
        answer: answer.trim(),
      });

      // Evaluate answer
      const { data: evalData } = await interviewAPI.evaluateAnswer(interviewId, {
        questionIndex: currentQuestionIndex,
      });

      // Update local questions state with evaluation
      setQuestions(prev => {
        const updated = [...prev];
        updated[currentQuestionIndex] = {
          ...updated[currentQuestionIndex],
          userAnswer: answer.trim(),
          ...evalData.evaluation,
        };
        return updated;
      });

      setAnswer('');

      // Move to next question or results
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setPhase(PHASES.EVALUATING);
        await finishInterview();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Finish interview and get results
  const finishInterview = async () => {
    try {
      const { data } = await interviewAPI.complete(interviewId);
      if (data.success) {
        setResults(data.interview);
        setPhase(PHASES.RESULTS);
        loadHistory();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete interview');
      setPhase(PHASES.INTERVIEW);
    }
  };

  // Skip question
  const skipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      setError('');
    } else {
      setPhase(PHASES.EVALUATING);
      finishInterview();
    }
  };

  // Restart
  const restart = () => {
    setPhase(PHASES.SETUP);
    setJobRole('');
    setDifficulty('medium');
    setQuestionCount(5);
    setInterviewId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setResults(null);
    setError('');
    timer.reset();
  };

  // View past interview
  const viewPastInterview = async (id) => {
    setLoading(true);
    try {
      const { data } = await interviewAPI.getSession(id);
      if (data.success) {
        setResults(data.interview);
        setQuestions(data.interview.questions);
        setPhase(PHASES.RESULTS);
      }
    } catch (err) {
      setError('Failed to load interview');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex) / questions.length) * 100 : 0;

  // ===================== SETUP PHASE =====================
  if (phase === PHASES.SETUP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                    AI Mock Interview
                  </h1>
                  <p className="text-xl text-gray-600 max-w-2xl">
                    Practice with realistic, AI-generated interview questions tailored to your target role.
                  </p>
                </div>
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <History size={18} />
                  History
                </button>
              </div>
            </div>

            {/* Setup Card */}
            <Card className="max-w-3xl mx-auto p-8 shadow-xl border-0">
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Your Interview</h2>
                <p className="text-gray-600">Select your target role and difficulty level</p>
              </div>

              <div className="space-y-8">
                {/* Job Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Target Job Role
                  </label>
                  <select
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800"
                  >
                    <option value="">Select a role...</option>
                    {JOB_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDifficulty(d.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          difficulty === d.value
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${d.color} mb-2`} />
                        <div className="font-semibold text-gray-900">{d.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Number of Questions: <span className="text-indigo-600">{questionCount}</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>3</span>
                    <span>10</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={startInterview}
                  disabled={loading}
                  size="lg"
                  className="w-full justify-center text-lg py-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      Start Mock Interview
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Quick Stats */}
            {history.length > 0 && (
              <div className="mt-10 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-indigo-600">{history.length}</div>
                  <p className="text-gray-600 text-sm">Interviews Taken</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(history.filter(h => h.status === 'completed').reduce((a, h) => a + (h.overallScore || 0), 0) / (history.filter(h => h.status === 'completed').length || 1))}%
                  </div>
                  <p className="text-gray-600 text-sm">Avg Score</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {history.filter(h => h.status === 'completed').length}
                  </div>
                  <p className="text-gray-600 text-sm">Completed</p>
                </Card>
              </div>
            )}
          </main>
        </div>

        {/* History Sidebar Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <History size={20} className="text-indigo-600" />
                  Interview History
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-6">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No interviews taken yet</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => { setShowHistory(false); viewPastInterview(item.id); }}
                        className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.jobRole}</h3>
                            <p className="text-sm text-gray-500">
                              {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)} · {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {item.status === 'completed' ? (
                              <div className="text-2xl font-bold text-indigo-600">{item.overallScore}%</div>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">In Progress</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ===================== INTERVIEW PHASE =====================
  if (phase === PHASES.INTERVIEW && currentQuestion) {
    const CategoryIcon = CATEGORY_ICONS[currentQuestion.category] || BrainCircuit;
    const categoryColor = CATEGORY_COLORS[currentQuestion.category] || 'bg-gray-100 text-gray-700';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{jobRole} Interview</h1>
                  <p className="text-sm text-gray-500">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="font-mono">{timer.formatted}</span>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {currentQuestionIndex + 1} / {questions.length}
                </div>
              </div>
            </div>
          </header>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-1">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {/* Question Card */}
              <Card className="p-8 shadow-xl border-0 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${categoryColor}`}>
                    <CategoryIcon size={14} />
                    {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 leading-relaxed mb-2">
                  {currentQuestion.questionText}
                </h2>
                <p className="text-sm text-gray-500">Max Score: {currentQuestion.maxScore} points</p>
              </Card>

              {/* Answer Input */}
              <Card className="p-6 shadow-lg border-0">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Answer
                </label>
                <textarea
                  ref={answerRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here... Be as detailed as possible."
                  className="w-full min-h-[200px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-800 leading-relaxed"
                  disabled={loading}
                />

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <Button
                    onClick={skipQuestion}
                    variant="secondary"
                    disabled={loading}
                  >
                    Skip Question
                  </Button>
                  <div className="flex gap-3">
                    {currentQuestionIndex > 0 && (
                      <Button
                        onClick={() => {
                          setCurrentQuestionIndex(prev => prev - 1);
                          setAnswer(questions[currentQuestionIndex - 1]?.userAnswer || '');
                          setError('');
                        }}
                        variant="secondary"
                        disabled={loading}
                      >
                        <ChevronLeft size={18} className="mr-1" />
                        Previous
                      </Button>
                    )}
                    <Button
                      onClick={submitCurrentAnswer}
                      disabled={loading || !answer.trim()}
                      className="justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Evaluating...
                        </>
                      ) : currentQuestionIndex === questions.length - 1 ? (
                        <>
                          Finish Interview
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Next Question
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ===================== EVALUATING PHASE =====================
  if (phase === PHASES.EVALUATING) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Evaluating Your Interview</h2>
          <p className="text-xl text-gray-600">Our AI is analyzing your answers and preparing detailed feedback...</p>
        </div>
      </div>
    );
  }

  // ===================== RESULTS PHASE =====================
  if (phase === PHASES.RESULTS && results) {
    const scoreColor = results.overallScore >= 80 ? 'text-green-600' : results.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600';
    const scoreBg = results.overallScore >= 80 ? 'bg-green-50 border-green-200' : results.overallScore >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {/* Results Header */}
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
                <p className="text-xl text-gray-600">{results.jobRole} · {results.difficulty.charAt(0).toUpperCase() + results.difficulty.slice(1)} Level</p>
              </div>

              {/* Overall Score */}
              <Card className={`p-8 mb-8 border-2 ${scoreBg}`}>
                <div className="text-center">
                  <div className={`text-7xl font-bold ${scoreColor} mb-2`}>{results.overallScore}%</div>
                  <p className="text-lg text-gray-600 mb-4">Overall Score</p>
                  <p className="text-gray-700 max-w-2xl mx-auto">{results.summaryFeedback}</p>
                </div>
              </Card>

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {results.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    )) || <li className="text-gray-500 italic">No specific strengths identified</li>}
                  </ul>
                </Card>

                <Card className="p-6 border-0 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {results.improvements?.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <Award className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        {imp}
                      </li>
                    )) || <li className="text-gray-500 italic">No specific improvements suggested</li>}
                  </ul>
                </Card>
              </div>

              {/* Per-Question Breakdown */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Breakdown</h2>
              <div className="space-y-6 mb-10">
                {results.questions?.map((q, idx) => {
                  const qScoreColor = q.score >= 8 ? 'text-green-600' : q.score >= 5 ? 'text-yellow-600' : 'text-red-600';
                  return (
                    <Card key={idx} className="p-6 border-0 shadow-lg">

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${CATEGORY_COLORS[q.category] || 'bg-gray-100 text-gray-700'}`}>
                            <CategoryIcon size={12} />
                            {q.category.charAt(0).toUpperCase() + q.category.slice(1)}

                          </span>
                        </div>
                        <div className={`text-2xl font-bold ${qScoreColor}`}>
                          {q.score}/{q.maxScore}
                        </div>
                      </div>

                      <p className="text-gray-900 font-medium mb-4">{q.questionText}</p>

                      {q.userAnswer && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Your Answer</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{q.userAnswer}</p>
                        </div>
                      )}

                      {q.aiFeedback && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-xs font-semibold text-blue-600 uppercase mb-2">AI Feedback</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{q.aiFeedback}</p>
                        </div>
                      )}

                      {q.modelAnswer && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                          <p className="text-xs font-semibold text-green-600 uppercase mb-2">Model Answer</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{q.modelAnswer}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pb-10">
                <Button onClick={restart} variant="secondary" className="justify-center">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Interview
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="justify-center">
                  Back to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}

