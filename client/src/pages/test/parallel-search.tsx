import { ParallelSearchTest } from '@/components/test/ParallelSearchTest';
import { AuthProvider } from '@/context/AuthContext';

export default function ParallelSearchTestPage() {
  return (
    <AuthProvider>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Parallel Search Service Test Page</h1>
        <ParallelSearchTest />
      </div>
    </AuthProvider>
  );
} 