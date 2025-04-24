import React from 'react';
import { FourYearCollegePathTest } from '@/components/test/FourYearCollegePathTest';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';

export default function FourYearPathTestPage() {
  return (
    <AuthProvider>
      <FourYearPathTestContent />
    </AuthProvider>
  );
}

// Separate component to use hooks within AuthProvider context
function FourYearPathTestContent() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <FourYearCollegePathTest 
      isAuthenticated={isAuthenticated}
      user={user ? { id: user.id } : undefined}
    />
  );
} 