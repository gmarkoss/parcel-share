'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Parcel, Trip } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  isParcelFuture,
  isTripFuture,
} from '@/lib/filterUtils';

export default function Search() {
  const [activeTab, setActiveTab] = useState<'parcels' | 'trips'>('parcels');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [parcelsRes, tripsRes] = await Promise.all([
        api.get('/parcels?status=requested'),
        api.get('/trips?status=planned'),
      ]);
      // Filter to only show future parcels and trips
      const futureParcels = parcelsRes.data.filter(isParcelFuture);
      const futureTrips = tripsRes.data.filter(isTripFuture);
      setParcels(futureParcels);
      setTrips(futureTrips);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search & Match</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('parcels')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'parcels'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Available Parcels ({parcels.length})
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'trips'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Available Trips ({trips.length})
        </button>
      </div>

      {/* Parcels Tab */}
      {activeTab === 'parcels' && (
        <div>
          {parcels.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
              No parcels available at the moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parcels.map((parcel) => (
                <div key={parcel.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      {parcel.size}
                    </span>
                    {parcel.rewardAmount && (
                      <span className="text-green-600 font-semibold">
                        €{parcel.rewardAmount}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">
                    {parcel.fromLocation} → {parcel.toLocation}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Pickup: {format(new Date(parcel.desiredPickupDate), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Delivery: {format(new Date(parcel.desiredDeliveryDate), 'MMM d, yyyy')}
                  </p>
                  {parcel.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {parcel.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-3">
                    Sender: {parcel.sender?.name || 'Unknown'}
                  </p>
                  <Link
                    href={`/parcels/${parcel.id}`}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <div>
          {trips.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
              No trips available at the moment.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {trip.transportType}
                    </span>
                    <span className="text-sm text-gray-600">
                      Capacity: {trip.availableCapacity}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">
                    {trip.fromLocation} → {trip.toLocation}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Departure: {format(new Date(trip.departureTime), 'MMM d, yyyy HH:mm')}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Arrival: {format(new Date(trip.arrivalTime), 'MMM d, yyyy HH:mm')}
                  </p>
                  {trip.notes && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {trip.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-3">
                    Traveler: {trip.traveler?.name || 'Unknown'}
                  </p>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

