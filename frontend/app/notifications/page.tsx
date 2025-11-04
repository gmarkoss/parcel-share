'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Notification } from '@/lib/types';
import { format } from 'date-fns';

// Disable static generation
export const dynamic = 'force-dynamic';

export default function Notifications() {
  const { user, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    } else if (user) {
      fetchNotifications();
    }
  }, [user, authLoading, filter]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get(`/notifications?unreadOnly=${filter === 'unread'}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-md ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
          No notifications to show.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow ${
                !notification.isRead ? 'border-l-4 border-blue-600' : ''
              }`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className={`${!notification.isRead ? 'font-semibold' : ''}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
                {!notification.isRead && (
                  <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


