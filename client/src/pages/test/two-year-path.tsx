import React from 'react';
import { TwoYearCollegePathTest } from "@/components/test/TwoYearCollegePathTest";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Separate component that uses useAuth
function TwoYearPathContent() {
  const { isAuthenticated, user } = useAuth();
  return <TwoYearCollegePathTest isAuthenticated={isAuthenticated} user={user ? { id: user.id } : undefined} />;
}

export default function TwoYearPathTestPage() {
  return (
    <AuthProvider>
      <TwoYearPathContent />
    </AuthProvider>
  );
} 