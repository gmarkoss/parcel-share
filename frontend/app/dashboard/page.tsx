'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Parcel, Trip } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import StatusTab, { TabFilter } from '@/components/StatusTab';
import {
  filterParcels,
  filterTrips,
  getParcelCounts,
  getTripCounts,
} from '@/lib/filterUtils';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parcelFilter, setParcelFilter] = useState<TabFilter>('active');
  const [tripFilter, setTripFilter] = useState<TabFilter>('active');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [parcelsRes, tripsRes] = await Promise.all([
        api.get('/parcels/my-parcels'),
        api.get('/trips/my-trips'),
      ]);
      setParcels(parcelsRes.data);
      setTrips(tripsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link
          href="/parcels/create"
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 sm:p-6 rounded-lg text-center"
        >
          <div className="text-2xl sm:text-3xl mb-2">📦</div>
          <h3 className="text-lg sm:text-xl font-semibold">Send a Parcel</h3>
          <p className="text-xs sm:text-sm mt-1 opacity-90">Request delivery for your item</p>
        </Link>
        <Link
          href="/trips/create"
          className="bg-green-600 hover:bg-green-700 text-white p-4 sm:p-6 rounded-lg text-center"
        >
          <div className="text-2xl sm:text-3xl mb-2">🚗</div>
          <h3 className="text-lg sm:text-xl font-semibold">Offer a Trip</h3>
          <p className="text-xs sm:text-sm mt-1 opacity-90">Earn by carrying parcels</p>
        </Link>
      </div>

      {/* My Parcels */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">My Parcels</h2>
        <StatusTab
          activeFilter={parcelFilter}
          onFilterChange={setParcelFilter}
          activeCount={getParcelCounts(parcels).active}
          pastCount={getParcelCounts(parcels).past}
          completedCount={getParcelCounts(parcels).completed}
          allCount={getParcelCounts(parcels).all}
        />
        {parcels.length === 0 ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center text-sm sm:text-base text-gray-500">
            No parcels yet. Create your first parcel request!
          </div>
        ) : filterParcels(parcels, parcelFilter).length === 0 ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center text-sm sm:text-base text-gray-500">
            No {parcelFilter === 'active' ? 'active' : parcelFilter === 'past' ? 'past' : parcelFilter === 'completed' ? 'completed' : ''} parcels found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filterParcels(parcels, parcelFilter).map((parcel) => (
              <div key={parcel.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    parcel.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                    parcel.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    parcel.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    parcel.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {parcel.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">{parcel.size}</span>
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  {parcel.fromLocation} → {parcel.toLocation}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Pickup: {format(new Date(parcel.desiredPickupDate), 'MMM d, yyyy')}
                </p>
                {parcel.rewardAmount && (
                  <p className="text-xs sm:text-sm font-semibold text-green-600">
                    Reward: €{parcel.rewardAmount}
                  </p>
                )}
                <Link
                  href={`/parcels/${parcel.id}`}
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium mt-2 inline-block"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Trips */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">My Trips</h2>
        <StatusTab
          activeFilter={tripFilter}
          onFilterChange={setTripFilter}
          activeCount={getTripCounts(trips).active}
          pastCount={getTripCounts(trips).past}
          completedCount={getTripCounts(trips).completed}
          allCount={getTripCounts(trips).all}
        />
        {trips.length === 0 ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center text-sm sm:text-base text-gray-500">
            No trips yet. Offer your first trip!
          </div>
        ) : filterTrips(trips, tripFilter).length === 0 ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center text-sm sm:text-base text-gray-500">
            No {tripFilter === 'active' ? 'active' : tripFilter === 'past' ? 'past' : tripFilter === 'completed' ? 'completed' : ''} trips found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filterTrips(trips, tripFilter).map((trip) => (
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
                <p className="text-xs sm:text-sm text-gray-600">
                  Capacity: {trip.availableCapacity} parcels
                </p>
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
    </div>
  );
}


