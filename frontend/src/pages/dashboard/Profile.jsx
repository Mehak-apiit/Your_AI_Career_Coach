import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Save, User, Mail, Briefcase, Star, Edit3, Check, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    skills: [],
    experience: '',
    bio: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.get();
      setProfile(response.data);
      setSkillsInput(response.data.skills?.join(', ') || '');
    } catch (err) {
      console.error('Failed to load profile');
    }
  };

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    const skills = skillsInput.split(',').map(skill => skill.trim().toLowerCase()).filter(Boolean);
    
    const updatedProfile = {
      ...profile,
      skills,
    };

    try {
      await profileAPI.update(updatedProfile);
      setProfile(updatedProfile);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (editing) {
      setEditing(false);
      setSuccess('');
    } else {
      setEditing(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
              Profile
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Manage your personal information and career details
            </p>
          </div>

          <Card className="shadow-2xl border-0 overflow-hidden">
            <div className="p-8 lg:p-12">
              {/* Profile Header */}
              <div className="text-center mb-12">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 shadow-2xl border-8 border-white flex items-center justify-center">
                  <User className="w-16 h-16 text-white drop-shadow-lg" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-gray-900">
                    {profile.name || 'Your Name'}
                  </h2>
                  <p className="text-2xl text-gray-600">
                    {profile.email || 'email@example.com'}
                  </p>
                </div>
                <Button
                  onClick={toggleEdit}
                  variant={editing ? "secondary" : "default"}
                  className="mt-8 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {editing ? <Check className="w-5 h-5 mr-2" /> : <Edit3 className="w-5 h-5 mr-2" />}
                  {editing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>

              {success && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center text-emerald-800">
                    <Check className="w-5 h-5 mr-3" />
                    <span>{success}</span>
                  </div>
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleSave} className="space-y-8">
                {/* Name & Email */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name || ''}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      disabled={!editing}
                      className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm hover:shadow-md disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!editing}
                      className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm hover:shadow-md disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Professional Bio
                  </label>
                  <textarea
                    rows="4"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    disabled={!editing}
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm hover:shadow-md resize-vertical disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Tell us about your professional background..."
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Skills (comma separated)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={handleSkillsChange}
                      disabled={!editing}
                      className="w-full pl-12 pr-24 p-4 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm hover:shadow-md disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="JavaScript, React, Tailwind, Node.js..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 italic bg-white px-2 pointer-events-none">
                      {profile.skills?.length || 0} skills
                    </div>
                  </div>
                  {editing && profile.skills && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-xl">
                      <p className="text-sm font-medium text-blue-900 flex items-center">
                        Current skills: {profile.skills.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {editing && (
                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 shadow-xl hover:shadow-2xl transition-all font-semibold px-8 py-4 text-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button"
                      variant="secondary"
                      onClick={toggleEdit}
                      className="px-8 py-4 text-lg font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>

              {/* Current Skills Preview */}
              {!editing && profile.skills && profile.skills.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-amber-500" />
                    Your Skills
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-3 rounded-2xl font-medium text-amber-800 shadow-sm hover:shadow-md transition-all border border-amber-200">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Profile;

