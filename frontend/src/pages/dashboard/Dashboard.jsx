import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../lib/api';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Sidebar from '../../components/Sidebar';
import { Upload, Zap, MessageCircle, User, Mic } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    profileAPI.get().then(({ data }) => setProfile(data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 border-b border-white/20">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                Welcome back, {profile?.name || 'User'}!
              </h1>
              <p className="text-xl opacity-90">Here is your career dashboard</p>
            </div>
            <Button onClick={logout} variant="secondary" className="self-start lg:self-end w-fit">
              Logout
            </Button>
          </div>
        </div>

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="p-8 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{profile?.skills?.length || 0}</h3>
              <p className="text-gray-600">Skills Listed</p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">2</h3>
              <p className="text-gray-600">Resumes Analyzed</p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">5</h3>
              <p className="text-gray-600">AI Checks</p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">3</h3>
              <p className="text-gray-600">Chat Sessions</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            <Link to="/dashboard/resume" className="block">
              <Card className="p-8 h-full group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center group-hover:text-emerald-600 transition-colors">Resume Analyzer</h3>
                <p className="text-gray-600 mb-8 text-center leading-relaxed">Upload your resume for comprehensive AI analysis and actionable improvement suggestions</p>
                <Button size="lg" className="w-full group-hover:bg-emerald-600 group-hover:shadow-xl transition-all">Analyze Resume</Button>
              </Card>
            </Link>

            <Link to="/dashboard/chat" className="block">
              <Card className="p-8 h-full group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center group-hover:text-purple-600 transition-colors">AI Career Chat</h3>
                <p className="text-gray-600 mb-8 text-center leading-relaxed">Chat with your personal AI career coach for real-time guidance and advice</p>
                <Button size="lg" className="w-full group-hover:bg-purple-600 group-hover:shadow-xl transition-all">Start Chat</Button>
              </Card>
            </Link>

            <Link to="/dashboard/interview" className="block">
              <Card className="p-8 h-full group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center group-hover:text-indigo-600 transition-colors">Mock Interview</h3>
                <p className="text-gray-600 mb-8 text-center leading-relaxed">Practice with AI-generated interview questions and get detailed performance feedback</p>
                <Button size="lg" className="w-full group-hover:bg-indigo-600 group-hover:shadow-xl transition-all">Start Interview</Button>
              </Card>
            </Link>

            <Link to="/dashboard/profile" className="block">
              <Card className="p-8 h-full group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center group-hover:text-blue-600 transition-colors">Profile</h3>
                <p className="text-gray-600 mb-8 text-center leading-relaxed">Manage your information, skills, and career preferences</p>
                <Button size="lg" className="w-full group-hover:bg-blue-600 group-hover:shadow-xl transition-all">View Profile</Button>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
