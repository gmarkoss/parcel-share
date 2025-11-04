'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { User, UserStatistics } from '@/lib/types';
import { format } from 'date-fns';

interface UserProfileCardProps {
  user: User;
  showLink?: boolean;
  currentUserId?: string | null;
}

export default function UserProfileCard({ user, showLink = true, currentUserId }: UserProfileCardProps) {
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, [user.id]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get(`/users/${user.id}/statistics`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-lg">★</span>
      );
    }

    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <span key="half" className="text-yellow-400 text-lg">☆</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
      );
    }

    return stars;
  };

  const isCurrentUser = currentUserId && user.id === currentUserId;

  const userName = (
    <div className="flex items-center gap-2">
      {showLink ? (
        <Link 
          href={`/users/${user.id}`}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          {user.name}{isCurrentUser && ' (me)'}
        </Link>
      ) : (
        <span className="font-semibold text-gray-900">{user.name}{isCurrentUser && ' (me)'}</span>
      )}
      {stats?.isVerified && (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
          ✓ Verified
        </span>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {userName}
        <div className="mt-2 text-sm text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {userName}
      
      {stats && (
        <div className="mt-3 space-y-2">
          {/* Rating */}
          {stats.averageRating > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(stats.averageRating)}
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
            <div className="text-sm text-gray-500">
              No ratings yet
            </div>
          )}

          {/* Statistics */}
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

      {!stats && !isLoading && (
        <div className="mt-2 text-sm text-gray-500">
          Unable to load profile statistics
        </div>
      )}
    </div>
  );
}

