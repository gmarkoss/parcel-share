'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { TransportType } from '@/lib/types';
import LocationAutocomplete from '@/components/parcels/LocationAutocomplete';
import DateTimePicker from '@/components/parcels/DateTimePicker';

export default function CreateTrip() {
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
    fromFullAddress: '',
    toFullAddress: '',
    transportType: TransportType.CAR,
    departureTime: '',
    arrivalTime: '',
    availableCapacity: 1,
    notes: '',
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

  const swapLocations = () => {
    setFormData({
      ...formData,
      fromLocation: formData.toLocation,
      toLocation: formData.fromLocation,
      fromLat: formData.toLat,
      fromLng: formData.toLng,
      toLat: formData.fromLat,
      toLng: formData.fromLng,
      fromFullAddress: formData.toFullAddress,
      toFullAddress: formData.fromFullAddress,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (new Date(formData.arrivalTime) <= new Date(formData.departureTime)) {
      setError('Arrival time must be after departure time');
      return;
    }

    setIsLoading(true);

    try {
      // Whitelist payload fields to ensure no UI-only properties are sent
      const payload = {
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        fromLat: formData.fromLat,
        fromLng: formData.fromLng,
        toLat: formData.toLat,
        toLng: formData.toLng,
        transportType: formData.transportType,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        availableCapacity: formData.availableCapacity,
        notes: formData.notes,
      };
      await api.post('/trips', payload);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">🚗 Offer a Trip</h1>
      <p className="text-gray-600 mb-6">Share your journey and earn by carrying parcels</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ROUTE SECTION - Green */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📍</span>
            <h2 className="text-lg font-bold text-green-900">Route</h2>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <LocationAutocomplete
                label="From Location"
                value={formData.fromLocation}
                onChange={(value) => setFormData({ ...formData, fromLocation: value })}
                onLocationSelect={(location, lat, lng, fullAddress) => 
                  setFormData({ ...formData, fromLocation: location, fromLat: lat, fromLng: lng, fromFullAddress: fullAddress || '' })
                }
                placeholder="Where are you starting?"
                required
                fullAddress={formData.fromFullAddress}
              />

              <LocationAutocomplete
                label="Destination"
                value={formData.toLocation}
                onChange={(value) => setFormData({ ...formData, toLocation: value })}
                onLocationSelect={(location, lat, lng, fullAddress) => 
                  setFormData({ ...formData, toLocation: location, toLat: lat, toLng: lng, toFullAddress: fullAddress || '' })
                }
                placeholder="Where are you heading?"
                required
                fullAddress={formData.toFullAddress}
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={swapLocations}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-green-400 rounded-full p-2 shadow-lg hover:bg-green-50 hover:border-green-600 transition-all duration-200 z-10"
              title="Swap locations"
              aria-label="Swap from and destination locations"
            >
              {/* Up/Down arrows for mobile */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:hidden text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {/* Left/Right arrows for desktop */}
              <svg xmlns="http://www.w3.org/2000/svg" className="hidden md:block h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>

          {/* Route Preview */}
          {distance && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-lg">⏱️</span>
                <span className="font-medium">Distance: ~{distance} km</span>
              </div>
            </div>
          )}
        </div>

        {/* SCHEDULE SECTION - Purple */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🗓️</span>
            <h2 className="text-lg font-bold text-purple-900">Schedule</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DateTimePicker
              label="Departure Date & Time"
              value={formData.departureTime}
              onChange={(value) => setFormData({ ...formData, departureTime: value })}
              required
            />

            <DateTimePicker
              label="Arrival Date & Time"
              value={formData.arrivalTime}
              onChange={(value) => setFormData({ ...formData, arrivalTime: value })}
              required
              minDate={formData.departureTime}
            />
          </div>
        </div>

        {/* TRIP DETAILS SECTION */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚗</span>
            <h2 className="text-lg font-bold">Trip Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Type *
              </label>
              <select
                value={formData.transportType}
                onChange={(e) => setFormData({ ...formData, transportType: e.target.value as TransportType })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={TransportType.CAR}>🚗 Car</option>
                <option value={TransportType.BUS}>🚌 Bus</option>
                <option value={TransportType.TRAIN}>🚂 Train</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Capacity *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.availableCapacity}
                onChange={(e) => setFormData({ ...formData, availableCapacity: parseInt(e.target.value) })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="How many parcels can you carry?"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Number of parcels you can carry on this trip
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Any additional information? (e.g., I'll be driving via highway, Flexible departure time...)"
              />
              <p className="text-xs text-gray-500 mt-1">
                💬 Help senders know more about your trip
              </p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 transition-all"
          >
            {isLoading ? '⏳ Creating...' : '✨ Create Trip Offer'}
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
