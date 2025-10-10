'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Trip, MatchResult } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';

export default function TripDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTrip();
      fetchMatches();
    }
  }, [params.id]);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${params.id}`);
      setTrip(response.data);
    } catch (error) {
      console.error('Failed to fetch trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await api.get(`/matching/trip/${params.id}`);
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const acceptParcel = async (parcelId: string) => {
    try {
      await api.post(`/parcels/${parcelId}/accept`, { tripId: params.id });
      fetchTrip();
      fetchMatches();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept parcel');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!trip) {
    return <div className="text-center py-12">Trip not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
      >
        ← Back
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">Trip Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
            trip.status === 'in_progress' ? 'bg-green-100 text-green-800' :
            trip.status === 'completed' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {trip.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Route</h3>
            <p className="text-gray-700">From: {trip.fromLocation}</p>
            <p className="text-gray-700">To: {trip.toLocation}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Timeline</h3>
            <p className="text-gray-700">
              Departure: {format(new Date(trip.departureTime), 'MMM d, yyyy HH:mm')}
            </p>
            <p className="text-gray-700">
              Arrival: {format(new Date(trip.arrivalTime), 'MMM d, yyyy HH:mm')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Details</h3>
            <p className="text-gray-700">Transport: {trip.transportType}</p>
            <p className="text-gray-700">Capacity: {trip.availableCapacity} parcels</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Traveler</h3>
            <p className="text-gray-700">{trip.traveler?.name || 'Unknown'}</p>
            <p className="text-gray-600 text-sm">{trip.traveler?.email || 'Unknown'}</p>
          </div>
        </div>

        {trip.notes && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Notes</h3>
            <p className="text-gray-700">{trip.notes}</p>
          </div>
        )}

        {trip.parcels && trip.parcels.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Accepted Parcels</h3>
            <div className="space-y-2">
              {trip.parcels.map((parcel) => (
                <div key={parcel.id} className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">
                    {parcel.fromLocation} → {parcel.toLocation}
                  </p>
                  <p className="text-sm text-gray-600">Size: {parcel.size}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matching Parcels */}
      {trip.status === 'planned' && matches.length > 0 && user && user.id === trip.travelerId && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Matching Parcels</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.parcel.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {match.parcel.fromLocation} → {match.parcel.toLocation}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Match Score: {Math.round(match.matchScore)}%
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    {match.parcel.size}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-2">
                  Pickup: {format(new Date(match.parcel.desiredPickupDate), 'MMM d, yyyy HH:mm')}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Sender: {match.parcel.sender?.name || 'Unknown'}
                </p>
                {match.parcel.rewardAmount && (
                  <p className="text-green-600 font-semibold mb-2">
                    Reward: €{match.parcel.rewardAmount}
                  </p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => acceptParcel(match.parcel.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Accept Parcel
                  </button>
                  <Link
                    href={`/parcels/${match.parcel.id}`}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    View Parcel
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

