import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  async function handleLogout() {
    setError('');
    
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    }
  }
  
  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">Financial Planner</Link>
            </div>
            {currentUser && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link to="/dashboard" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                  <Link to="/profile" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
                  {/* Add more navigation links as needed */}
                </div>
              </div>
            )}
            
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log Out
                </button>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium">
                    Log In
                  </Link>
                  <Link to="/signup" className="bg-white text-indigo-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="md:hidden">
        {currentUser && (
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/dashboard" className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
            <Link to="/profile" className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">
              Profile
            </Link>
          </div>
        )}
        <div className="pt-4 pb-3 border-t border-indigo-700">
          {currentUser ? (
            <div className="px-2">
              <button
                onClick={handleLogout}
                className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="space-y-1 px-2">
              <Link to="/login" className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">
                Log In
              </Link>
              <Link to="/signup" className="bg-white text-indigo-600 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}