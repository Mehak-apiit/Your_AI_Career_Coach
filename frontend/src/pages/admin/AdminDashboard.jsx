import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Users, MessageCircle, FileText, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalResumes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/dashboard';
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics'),
      ]);
      // Backend returns { success: true, data: users }
      const usersData = usersRes.data?.data || usersRes.data || [];
      setUsers(usersData);
      // Backend returns { success: true, analytics: {...} }
      const analyticsData = analyticsRes.data?.analytics || analyticsRes.data || analytics;
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    setDeletingUser(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setDeletingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">Manage users and view platform analytics</p>
          </div>
          <Button onClick={logout} variant="secondary">
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-800">{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchData} className="ml-auto">
              Retry
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Analytics Cards */}
          <Card className="lg:col-span-1 p-8 hover:shadow-xl transition-all group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors mr-4">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Total Users</h3>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {analytics.totalUsers || 0}
            </div>
            <p className="text-green-600 font-medium">+12% from last month</p>
          </Card>

          <Card className="lg:col-span-1 p-8 hover:shadow-xl transition-all group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors mr-4">
                <MessageCircle className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Total Chats</h3>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {analytics.totalChats || 0}
            </div>
            <p className="text-green-600 font-medium">+28% from last month</p>
          </Card>

          <Card className="lg:col-span-1 p-8 hover:shadow-xl transition-all group">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors mr-4">
                <FileText className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Resumes Analyzed</h3>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {analytics.totalResumes || 0}
            </div>
            <p className="text-green-600 font-medium">+15% from last month</p>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all">
            <Button onClick={fetchData} className="w-full group">
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                User Management ({users.length || 0} users)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => deleteUser(user._id)}
                          disabled={deletingUser === user._id}
                          variant="destructive"
                          size="sm"
                          className="shadow-md hover:shadow-lg transition-all"
                        >
                          {deletingUser === user._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Platform has no registered users yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

