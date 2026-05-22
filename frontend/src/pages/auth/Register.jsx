import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ArrowLeft, User, Mail, Lock, FileText, BookOpen, Stars, Briefcase, CheckCircle, Plus, X } from 'lucide-react';

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);

  const defaultValues = {
    email: '',
    password: '',
    name: '',
    role: 'user',
    resumeData: {
      content: '',
      skills: [],
      experience: '',
      education: '',
      score: 0,
      suggestions: []
    },
    recommendations: []
  };

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, trigger, getValues } = useForm({
    defaultValues
  });

  const watchedSkills = watch('resumeData.skills') || [];

  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Resume Content', icon: FileText },
    { id: 3, title: 'Skills', icon: Stars },
    { id: 4, title: 'Experience & Education', icon: BookOpen },
    { id: 5, title: 'Review', icon: CheckCircle }
  ];

  const totalSteps = steps.length;

  const addSkill = () => {
    const input = document.getElementById('skill-input');
    if (input.value.trim()) {
      const newSkills = [...(getValues('resumeData.skills') || []), input.value.trim()];
      setValue('resumeData.skills', newSkills);
      setSkills(newSkills);
      input.value = '';
    }
  };

  const removeSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setValue('resumeData.skills', newSkills);
    setSkills(newSkills);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setValue('resumeData.content', file, { shouldValidate: true });
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 ? ['email', 'password', 'name'] : 
                            currentStep === 3 ? ['resumeData.skills'] : 
                            currentStep === 2 ? ['resumeData.content'] : 
                            currentStep === 4 ? ['resumeData.experience', 'resumeData.education'] : [];
    const isValid = await trigger(fieldsToValidate.join(','));
    if (isValid && currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const onSubmit = async (data) => {
    data.resumeData.skills = skills;
    const success = await authRegister(data);
    if (success) navigate('/dashboard');
  };

  const Icon = steps[currentStep - 1]?.icon;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={24} className="mr-2" />
            Back to Home
          </Link>
          <Icon className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-lg text-gray-600">Step {currentStep} of {totalSteps}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center mb-8">
          {steps.map((step) => (
            <div key={step.id} className={`w-3 h-3 rounded-full mx-2 transition-all ${step.id <= currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
                    type="password"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  {...register('role')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Upload Resume</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {resumeFile && <p className="mt-2 text-sm text-green-600">Selected: {resumeFile.name}</p>}
              <p className="mt-2 text-sm text-gray-500">Accepted formats: PDF, DOC, DOCX, TXT</p>
              {!resumeFile && errors.resumeData?.content && <p className="mt-1 text-sm text-red-600">Resume file is required</p>}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Skills</label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    id="skill-input"
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., JavaScript, React"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="md">
                    <Plus size={20} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {skill}
                      <Button type="button" variant="danger" size="sm" className="ml-2 p-0 h-5 w-5" onClick={() => removeSkill(index)}>
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {watchedSkills.length === 0 && <p className="text-sm text-gray-500 mt-2">Add at least one skill</p>}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <textarea
                  {...register('resumeData.experience')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Describe your work experience..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <textarea
                  {...register('resumeData.education')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Your educational background..."
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Review Your Info</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {getValues('name') || 'N/A'}</div>
                <div><strong>Email:</strong> {getValues('email') || 'N/A'}</div>
                <div><strong>Role:</strong> {getValues('role') || 'N/A'}</div>
                <div><strong>Skills:</strong> {skills.join(', ') || 'None'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <strong>Resume:</strong>
                <p className="text-sm mt-2">
                  {getValues('resumeData.content') instanceof File 
                    ? getValues('resumeData.content').name 
                    : getValues('resumeData.content') || 'No file uploaded'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              className="flex-1"
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} className="flex-1" disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Register;

