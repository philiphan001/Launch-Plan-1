import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { currentUser } = useAuth();

  // If not authenticated, redirect to login
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}