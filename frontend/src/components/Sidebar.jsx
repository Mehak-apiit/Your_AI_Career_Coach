import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageCircle, User, LogOut, Map, Mic } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', path: '/dashboard/resume', icon: FileText },
    { name: 'Roadmap Generator', path: '/dashboard/roadmap', icon: Map },
    { name: 'AI Chat', path: '/dashboard/chat', icon: MessageCircle },
    { name: 'Mock Interview', path: '/dashboard/interview', icon: Mic },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
  ];

  const handleLogout = () => { navigate('/'); };

  return (
    <>
      {collapsed && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setCollapsed(false)} />
      )}
      <aside className="fixed left-0 top-0 z-50 h-full bg-white shadow-xl w-72 lg:w-64 lg:relative">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">AI Career Coach</span>
            </div>
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"><LogOut size={20} /></button>
          </div>
        </div>
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={`flex items-center p-3 rounded-xl transition-all duration-200 group hover:bg-blue-50 hover:shadow-md ${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border-2 border-white/50' : 'text-gray-700 hover:text-blue-600'}`}>
                  <Icon size={20} className={`mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            <li className="mt-8 pt-8 border-t border-gray-200">
              <button onClick={handleLogout} className="w-full flex items-center p-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group">
                <LogOut size={20} className="mr-3 flex-shrink-0 text-red-500 group-hover:text-red-600" />
                <span className="font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
