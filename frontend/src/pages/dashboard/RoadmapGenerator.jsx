import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Map, Loader2, CheckCircle, AlertCircle, BookOpen, Clock, Target, Lightbulb } from 'lucide-react';
import { aiAPI } from '../../lib/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Sidebar from '../../components/Sidebar';

const schema = yup.object({
  currentRole: yup.string().required('Current role is required'),
  targetRole: yup.string().required('Target role is required'),
  experience: yup.number().min(0).max(50).required('Experience is required'),
  currentSkills: yup.string().required('Current skills are required'),
  targetSkills: yup.string().required('Target skills are required'),
  timeFrame: yup.string().required('Time frame is required'),
  learningStyle: yup.string().required('Learning style is required'),
  goals: yup.string().required('Goals are required'),
});

const RoadmapGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setRoadmap(null);

    try {
      // Convert comma-separated strings to arrays
      const processedData = {
        ...data,
        currentSkills: data.currentSkills.split(',').map(s => s.trim()).filter(s => s),
        targetSkills: data.targetSkills.split(',').map(s => s.trim()).filter(s => s),
      };

      const result = await aiAPI.generateRoadmap(processedData);
      setRoadmap(result.data.roadmap);
    } catch (err) {
      console.error('Roadmap generation error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Roadmap generation failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderPhase = (phase, index) => (
    <Card key={index} className="mb-6 p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{phase.name}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            <span>{phase.duration}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">Phase {index + 1}</div>
      </div>

      {phase.objectives && phase.objectives.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Objectives
          </h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {phase.objectives.map((objective, i) => (
              <li key={i}>{objective}</li>
            ))}
          </ul>
        </div>
      )}

      {phase.resources && phase.resources.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Recommended Resources
          </h4>
          <div className="space-y-2">
            {phase.resources.map((resource, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-900">{resource.title}</div>
                <div className="text-sm text-gray-600">
                  {resource.platform} • {resource.duration}
                  {resource.url && (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2 hover:underline">
                      View Course
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase.projects && phase.projects.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Projects to Build</h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {phase.projects.map((project, i) => (
              <li key={i}>{project}</li>
            ))}
          </ul>
        </div>
      )}

      {phase.milestones && phase.milestones.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Milestones</h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {phase.milestones.map((milestone, i) => (
              <li key={i}>{milestone}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
              Personalized Roadmap Generator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Get a customized learning path to achieve your career goals with AI-powered recommendations.
            </p>
          </div>

          {/* Form Section */}
          <Card className="max-w-4xl mx-auto mb-12 p-8 shadow-xl border-0">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Map className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Learning Roadmap</h2>
              <p className="text-gray-600">Fill in your details to generate a personalized career development plan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                  <input
                    {...register('currentRole')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., Junior Developer"
                  />
                  {errors.currentRole && <p className="text-red-500 text-sm mt-1">{errors.currentRole.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
                  <input
                    {...register('targetRole')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., Senior Full Stack Developer"
                  />
                  {errors.targetRole && <p className="text-red-500 text-sm mt-1">{errors.targetRole.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    {...register('experience')}
                    type="number"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., 2"
                  />
                  {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Frame</label>
                  <select
                    {...register('timeFrame')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select time frame</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                    <option value="2 years">2 years</option>
                  </select>
                  {errors.timeFrame && <p className="text-red-500 text-sm mt-1">{errors.timeFrame.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Skills (comma-separated)</label>
                <textarea
                  {...register('currentSkills')}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., JavaScript, React, Node.js, SQL"
                />
                {errors.currentSkills && <p className="text-red-500 text-sm mt-1">{errors.currentSkills.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Skills to Learn (comma-separated)</label>
                <textarea
                  {...register('targetSkills')}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., TypeScript, AWS, Docker, GraphQL"
                />
                {errors.targetSkills && <p className="text-red-500 text-sm mt-1">{errors.targetSkills.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
                <select
                  {...register('learningStyle')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">Select learning style</option>
                  <option value="Video courses">Video courses</option>
                  <option value="Reading books/docs">Reading books/docs</option>
                  <option value="Hands-on projects">Hands-on projects</option>
                  <option value="Mixed (videos, projects, reading)">Mixed (videos, projects, reading)</option>
                </select>
                {errors.learningStyle && <p className="text-red-500 text-sm mt-1">{errors.learningStyle.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
                <textarea
                  {...register('goals')}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Describe your career aspirations and what you want to achieve..."
                />
                {errors.goals && <p className="text-red-500 text-sm mt-1">{errors.goals.message}</p>}
              </div>

              {error && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="text-center">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Roadmap...
                    </>
                  ) : (
                    <>
                      <Map className="w-5 h-5 mr-2" />
                      Generate My Roadmap
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Results Section */}
          {roadmap && (
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Personalized Roadmap</h2>
                  <p className="text-gray-700">{roadmap.overview}</p>
                  {roadmap.estimatedDuration && (
                    <p className="text-sm text-gray-600 mt-2">Estimated Duration: {roadmap.estimatedDuration}</p>
                  )}
                </div>
              </Card>

              {/* Skill Gaps */}
              {roadmap.skillGaps && roadmap.skillGaps.length > 0 && (
                <Card className="p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    Key Skills to Focus On
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.skillGaps.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Phases */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Your Learning Journey</h2>
                {roadmap.phases && roadmap.phases.map((phase, index) => renderPhase(phase, index))}
              </div>

              {/* Tips */}
              {roadmap.tips && roadmap.tips.length > 0 && (
                <Card className="p-6 mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-blue-500" />
                    Pro Tips for Success
                  </h3>
                  <ul className="space-y-2">
                    {roadmap.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RoadmapGenerator;