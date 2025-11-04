'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, render children immediately but without auth
  // Pages will handle their own loading states
  if (!mounted) {
    return (
      <>
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="text-xl md:text-2xl font-bold text-sky-600">
                  📦 Parcely
                </a>
              </div>
              <div className="flex items-center">
                <div className="hidden md:flex space-x-2">
                  <a href="/auth/signin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Sign In
                  </a>
                  <a href="/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Sign Up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </>
    );
  }

  // After mount, render with full auth context
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </AuthProvider>
  );
}

