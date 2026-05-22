import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Navbar from '../components/layout/Navbar';
import { ArrowRight, Users, Zap, Award } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Your Personal <span className="text-yellow-300">AI Career Coach</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Upload your resume and get AI-powered career guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-4">
                Get Started
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Users className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Happy Users</div>
            </div>
            <div className="text-center">
              <Zap className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
            <div className="text-center">
              <Award className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">$120K</div>
              <div className="text-blue-100">Avg Salary Boost</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
              Everything You Need to <span className="text-blue-600">Level Up</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI analyzes your resume, suggests personalized career paths, and coaches you to your dream job.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Resume Analysis */}
            <Card className="p-8 text-center group hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Resume Analysis</h3>
              <p className="text-gray-600 mb-6">Upload your resume and get AI-powered feedback.</p>
              <ArrowRight className="w-6 h-6 text-blue-600 mx-auto group-hover:translate-x-2 transition" />
            </Card>

            {/* AI Career Advice */}
            <Card className="p-8 text-center group hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition">
                <Award className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI Career Advice</h3>
              <p className="text-gray-600 mb-6">Get personalized career suggestions.</p>
              <ArrowRight className="w-6 h-6 text-green-600 mx-auto group-hover:translate-x-2 transition" />
            </Card>

            {/* AI Career Chat */}
            <Card className="p-8 text-center group hover:shadow-xl transition-all">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI Career Chat</h3>
              <p className="text-gray-600 mb-6">Chat with an AI mentor for career guidance.</p>
              <ArrowRight className="w-6 h-6 text-purple-600 mx-auto group-hover:translate-x-2 transition" />
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join thousands who have unlocked their dream careers with AI-powered guidance.
          </p>
          <Link to="/register">
            <Button size="xl" className="text-xl px-12 py-6 font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all bg-white text-gray-900">
              Get Started Now - It's Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

