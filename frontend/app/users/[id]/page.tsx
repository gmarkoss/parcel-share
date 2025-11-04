'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { User, UserStatistics } from '@/lib/types';
import { format } from 'date-fns';
import UserProfileCard from '@/components/UserProfileCard';

// Disable static generation
export const dynamic = 'force-dynamic';

export default function UserProfile() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUser();
      fetchUserStats();
    }
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${params.id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get(`/users/${params.id}/statistics`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!user && !stats) {
    return <div className="text-center py-12">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.history.back();
          }
        }}
        className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
      >
        ← Back
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>
        
        {user ? (
          <UserProfileCard user={user} showLink={false} currentUserId={currentUser?.id} />
        ) : stats ? (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-gray-900">User</span>
              {stats.isVerified && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                  ✓ Verified
                </span>
              )}
            </div>
            
            {stats && (
              <div className="mt-3 space-y-2">
                {stats.averageRating > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        if (i < Math.floor(stats.averageRating)) {
                          return <span key={i} className="text-yellow-400 text-lg">★</span>;
                        } else if (i === Math.floor(stats.averageRating) && stats.averageRating % 1 >= 0.5) {
                          return <span key={i} className="text-yellow-400 text-lg">☆</span>;
                        } else {
                          return <span key={i} className="text-gray-300 text-lg">★</span>;
                        }
                      })}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    {stats.totalReviews > 0 && (
                      <span className="text-sm text-gray-500">
                        ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No ratings yet</div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Deliveries:</span>
                    <span>{stats.completedDeliveries}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Member since:</span>
                    <span>{format(new Date(stats.memberSince), 'MMM yyyy')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

