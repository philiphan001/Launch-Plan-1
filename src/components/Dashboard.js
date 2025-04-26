import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Welcome, {currentUser?.displayName || currentUser?.email}!
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              This is your financial planning dashboard.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Account Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Active
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Plan Type
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Standard
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Last Login
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date().toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Main content area - replace with your financial planning components */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Example card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Financial Overview</h3>
              <div className="mt-3 text-sm text-gray-500">
                <p>Your financial data will appear here.</p>
              </div>
            </div>
          </div>
          
          {/* Example card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Investment Portfolio</h3>
              <div className="mt-3 text-sm text-gray-500">
                <p>Your investment data will appear here.</p>
              </div>
            </div>
          </div>
          
          {/* Example card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Budget Tracking</h3>
              <div className="mt-3 text-sm text-gray-500">
                <p>Your budget data will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}