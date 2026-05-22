import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
AI Career Coach

          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
                <Link to="/register"><Button>Sign Up Free</Button></Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${location.pathname === '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600">Admin</Link>
                )}
                <button onClick={handleLogout} className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-gray-100">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button size="sm">Menu</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;