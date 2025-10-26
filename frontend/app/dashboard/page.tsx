'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Parcel, Trip } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/parcels/create"
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center"
        >
          <div className="text-3xl mb-2">📦</div>
          <h3 className="text-xl font-semibold">Send a Parcel</h3>
          <p className="text-sm mt-1 opacity-90">Request delivery for your item</p>
        </Link>
        <Link
          href="/trips/create"
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center"
        >
          <div className="text-3xl mb-2">🚗</div>
          <h3 className="text-xl font-semibold">Offer a Trip</h3>
          <p className="text-sm mt-1 opacity-90">Earn by carrying parcels</p>
        </Link>
      </div>

      {/* My Parcels */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">My Parcels</h2>
        {parcels.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            No parcels yet. Create your first parcel request!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {parcels.map((parcel) => (
              <div key={parcel.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    parcel.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                    parcel.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    parcel.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    parcel.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {parcel.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">{parcel.size}</span>
                </div>
                <h3 className="font-semibold mb-2">
                  {parcel.fromLocation} → {parcel.toLocation}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Pickup: {format(new Date(parcel.desiredPickupDate), 'MMM d, yyyy')}
                </p>
                {parcel.rewardAmount && (
                  <p className="text-sm font-semibold text-green-600">
                    Reward: €{parcel.rewardAmount}
                  </p>
                )}
                <Link
                  href={`/parcels/${parcel.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
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
        <h2 className="text-2xl font-bold mb-4">My Trips</h2>
        {trips.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            No trips yet. Offer your first trip!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                    trip.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    trip.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trip.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">{trip.transportType}</span>
                </div>
                <h3 className="font-semibold mb-2">
                  {trip.fromLocation} → {trip.toLocation}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Departure: {format(new Date(trip.departureTime), 'MMM d, yyyy HH:mm')}
                </p>
                <p className="text-sm text-gray-600">
                  Capacity: {trip.availableCapacity} parcels
                </p>
                <Link
                  href={`/trips/${trip.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
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


