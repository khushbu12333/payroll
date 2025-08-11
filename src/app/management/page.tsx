'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagementPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to employee page since we integrated all management functionality there
    router.push('/employee');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to Employee Management...</p>
      </div>
    </div>
  );
} 