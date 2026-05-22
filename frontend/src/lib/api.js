import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const aiAPI = {
  analyzeResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/ai/resume-analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  careerAdvice: (data) => api.post('/ai/career-advice', data),
  generateRoadmap: (data) => api.post('/ai/generate-roadmap', data),
};

export const chatAPI = {
  getHistory: () => api.get('/chat'),
  sendMessage: (message) => api.post('/chat/new', { message }),
};

export const interviewAPI = {
  generate: (data) => api.post('/interview/generate', data),
  submitAnswer: (interviewId, data) => api.post(`/interview/${interviewId}/answer`, data),
  evaluateAnswer: (interviewId, data) => api.post(`/interview/${interviewId}/evaluate`, data),
  complete: (interviewId) => api.post(`/interview/${interviewId}/complete`),
  getSession: (interviewId) => api.get(`/interview/${interviewId}`),
  getHistory: () => api.get('/interview'),
};

export default api;
