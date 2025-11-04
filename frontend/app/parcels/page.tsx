'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Parcel } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import StatusTab, { TabFilter } from '@/components/StatusTab';
import {
  filterParcels,
  getParcelCounts,
} from '@/lib/filterUtils';

// Disable static generation
export const dynamic = 'force-dynamic';

export default function ParcelsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TabFilter>('active');

  useEffect(() => {
    if (!authLoading && !user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const response = await api.get('/parcels/my-parcels');
      setParcels(response.data);
    } catch (error) {
      console.error('Failed to fetch parcels:', error);
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

  const filteredParcels = filterParcels(parcels, filter);
  const counts = getParcelCounts(parcels);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Parcels</h1>
        <Link
          href="/parcels/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium"
        >
          + Create Parcel
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

      {parcels.length === 0 ? (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center text-sm sm:text-base text-gray-500">
          No parcels yet. Create your first parcel request!
        </div>
      ) : filteredParcels.length === 0 ? (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center text-sm sm:text-base text-gray-500">
          No {filter === 'active' ? 'active' : filter === 'past' ? 'past' : filter === 'completed' ? 'completed' : ''} parcels found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredParcels.map((parcel) => (
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
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Delivery: {format(new Date(parcel.desiredDeliveryDate), 'MMM d, yyyy')}
              </p>
              {parcel.rewardAmount && (
                <p className="text-xs sm:text-sm font-semibold text-green-600 mb-2">
                  Reward: €{parcel.rewardAmount}
                </p>
              )}
              {parcel.description && (
                <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-2">
                  {parcel.description}
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
  );
}

