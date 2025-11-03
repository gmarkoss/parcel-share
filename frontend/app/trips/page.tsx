'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Trip } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import StatusTab, { TabFilter } from '@/components/StatusTab';
import {
  filterTrips,
  getTripCounts,
} from '@/lib/filterUtils';

export default function TripsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TabFilter>('active');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const response = await api.get('/trips/my-trips');
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const filteredTrips = filterTrips(trips, filter);
  const counts = getTripCounts(trips);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Trips</h1>
        <Link
          href="/trips/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium"
        >
          + Create Trip
        </Link>
      </div>

      <StatusTab
        activeFilter={filter}
        onFilterChange={setFilter}
        activeCount={counts.active}
        pastCount={counts.past}
        completedCount={counts.completed}
        allCount={counts.all}
      />

      {trips.length === 0 ? (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center text-sm sm:text-base text-gray-500">
          No trips yet. Offer your first trip!
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center text-sm sm:text-base text-gray-500">
          No {filter === 'active' ? 'active' : filter === 'past' ? 'past' : filter === 'completed' ? 'completed' : ''} trips found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                  trip.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                  trip.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {trip.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">{trip.transportType}</span>
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">
                {trip.fromLocation} → {trip.toLocation}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Departure: {format(new Date(trip.departureTime), 'MMM d, yyyy HH:mm')}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Arrival: {format(new Date(trip.arrivalTime), 'MMM d, yyyy HH:mm')}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Capacity: {trip.availableCapacity} parcels
              </p>
              {trip.notes && (
                <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-2">
                  {trip.notes}
                </p>
              )}
              <Link
                href={`/trips/${trip.id}`}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium mt-2 inline-block"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

