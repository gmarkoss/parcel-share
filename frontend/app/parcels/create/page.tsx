'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ParcelSize } from '@/lib/types';
import LocationAutocomplete from '@/components/parcels/LocationAutocomplete';
import DateTimePicker from '@/components/parcels/DateTimePicker';

export default function CreateParcel() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fromLat: 0,
    fromLng: 0,
    toLat: 0,
    toLng: 0,
    size: ParcelSize.SMALL,
    description: '',
    rewardAmount: '',
    desiredPickupDate: '',
    desiredDeliveryDate: '',
  });

  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Calculate distance function (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }, []);

  // Calculate distance between two coordinates
  useEffect(() => {
    if (formData.fromLat && formData.fromLng && formData.toLat && formData.toLng) {
      const distance = calculateDistance(
        formData.fromLat,
        formData.fromLng,
        formData.toLat,
        formData.toLng
      );
      setDistance(distance);
    } else {
      setDistance(null);
    }
  }, [formData.fromLat, formData.fromLng, formData.toLat, formData.toLng, calculateDistance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (new Date(formData.desiredDeliveryDate) <= new Date(formData.desiredPickupDate)) {
      setError('Delivery date must be after pickup date');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        rewardAmount: formData.rewardAmount ? parseFloat(formData.rewardAmount) : undefined,
      };
      await api.post('/parcels', payload);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create parcel');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">📦 Send a Parcel</h1>
      <p className="text-gray-600 mb-6">Create a new parcel delivery request</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ROUTE SECTION - Blue */}
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-6 rounded-xl border-2 border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📍</span>
            <h2 className="text-lg font-bold text-blue-900">Route</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <LocationAutocomplete
              label="Pickup Location"
              value={formData.fromLocation}
              onChange={(value) => setFormData({ ...formData, fromLocation: value })}
              onLocationSelect={(location, lat, lng) => 
                setFormData({ ...formData, fromLocation: location, fromLat: lat, fromLng: lng })
              }
              placeholder="From where?"
              required
            />

            <LocationAutocomplete
              label="Delivery Location"
              value={formData.toLocation}
              onChange={(value) => setFormData({ ...formData, toLocation: value })}
              onLocationSelect={(location, lat, lng) => 
                setFormData({ ...formData, toLocation: location, toLat: lat, toLng: lng })
              }
              placeholder="Where to?"
              required
            />
          </div>

          {/* Route Preview */}
          {distance && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <span className="text-lg">⏱️</span>
                <span className="font-medium">Distance: ~{distance} km</span>
              </div>
            </div>
          )}
        </div>

        {/* TIME WINDOW SECTION - Purple */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🗓️</span>
            <h2 className="text-lg font-bold text-purple-900">Time Window</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DateTimePicker
              label="Pickup Date & Time"
              value={formData.desiredPickupDate}
              onChange={(value) => setFormData({ ...formData, desiredPickupDate: value })}
              required
            />

            <DateTimePicker
              label="Delivery Date & Time"
              value={formData.desiredDeliveryDate}
              onChange={(value) => setFormData({ ...formData, desiredDeliveryDate: value })}
              required
              minDate={formData.desiredPickupDate}
            />
          </div>
        </div>

        {/* PARCEL DETAILS SECTION */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📦</span>
            <h2 className="text-lg font-bold">Parcel Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parcel Size *
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value as ParcelSize })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ParcelSize.SMALL}>📱 Small (fits in bag)</option>
                <option value={ParcelSize.MEDIUM}>📦 Medium (small box)</option>
                <option value={ParcelSize.LARGE}>📦📦 Large (large box)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What are you sending? (e.g., Documents, Book, Clothes...)"
              />
              <p className="text-xs text-gray-500 mt-1">Help travelers know what they're carrying</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward Amount (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.rewardAmount}
                onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10.00"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Offer a reward to attract travelers</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 transition-all"
          >
            {isLoading ? '⏳ Creating...' : '✨ Create Parcel Request'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
