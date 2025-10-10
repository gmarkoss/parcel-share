'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Parcel, MatchResult } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ParcelDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchParcel();
      fetchMatches();
    }
  }, [params.id]);

  const fetchParcel = async () => {
    try {
      const response = await api.get(`/parcels/${params.id}`);
      setParcel(response.data);
    } catch (error) {
      console.error('Failed to fetch parcel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await api.get(`/matching/parcel/${params.id}`);
      setMatches(response.data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const acceptDelivery = async (tripId: string) => {
    try {
      await api.post(`/parcels/${params.id}/accept`, { tripId });
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept delivery');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!parcel) {
    return <div className="text-center py-12">Parcel not found</div>;
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
          <h1 className="text-3xl font-bold">Parcel Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            parcel.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
            parcel.status === 'accepted' ? 'bg-green-100 text-green-800' :
            parcel.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
            parcel.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {parcel.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Route</h3>
            <p className="text-gray-700">From: {parcel.fromLocation}</p>
            <p className="text-gray-700">To: {parcel.toLocation}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Timeline</h3>
            <p className="text-gray-700">
              Pickup: {format(new Date(parcel.desiredPickupDate), 'MMM d, yyyy HH:mm')}
            </p>
            <p className="text-gray-700">
              Delivery: {format(new Date(parcel.desiredDeliveryDate), 'MMM d, yyyy HH:mm')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Details</h3>
            <p className="text-gray-700">Size: {parcel.size}</p>
            {parcel.rewardAmount && (
              <p className="text-green-600 font-semibold">Reward: €{parcel.rewardAmount}</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Sender</h3>
            <p className="text-gray-700">{parcel.sender?.name || 'Unknown'}</p>
            <p className="text-gray-600 text-sm">{parcel.sender?.email || 'Unknown'}</p>
          </div>
        </div>

        {parcel.description && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{parcel.description}</p>
          </div>
        )}

        {parcel.carrier && (
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Carrier</h3>
            <p className="text-gray-700">{parcel.carrier?.name || 'Unknown'}</p>
            <p className="text-gray-600 text-sm">{parcel.carrier?.email || 'Unknown'}</p>
          </div>
        )}
      </div>

      {/* Matching Trips */}
      {parcel.status === 'requested' && matches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Matching Trips</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.trip.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {match.trip.fromLocation} → {match.trip.toLocation}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Match Score: {Math.round(match.matchScore)}%
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {match.trip.transportType}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-2">
                  Departure: {format(new Date(match.trip.departureTime), 'MMM d, yyyy HH:mm')}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  Traveler: {match.trip.traveler?.name || 'Unknown'}
                </p>

                <div className="flex gap-2 mt-4">
                  {user && user.id !== parcel.senderId && (
                    <button
                      onClick={() => acceptDelivery(match.trip.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Accept Delivery
                    </button>
                  )}
                  <Link
                    href={`/trips/${match.trip.id}`}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    View Trip
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

