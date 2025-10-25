'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ParcelSize } from '@/lib/types';

export default function CreateParcel() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fromLat: 52.3676, // Amsterdam default
    fromLng: 4.9041,
    toLat: 50.8503, // Brussels default
    toLng: 4.3517,
    size: ParcelSize.SMALL,
    description: '',
    rewardAmount: '',
    desiredPickupDate: '',
    desiredDeliveryDate: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Send a Parcel</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Location *
            </label>
            <input
              type="text"
              value={formData.fromLocation}
              onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Amsterdam, Netherlands"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Location *
            </label>
            <input
              type="text"
              value={formData.toLocation}
              onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brussels, Belgium"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Latitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.fromLat}
              onChange={(e) => setFormData({ ...formData, fromLat: parseFloat(e.target.value) })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Longitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.fromLng}
              onChange={(e) => setFormData({ ...formData, fromLng: parseFloat(e.target.value) })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Latitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.toLat}
              onChange={(e) => setFormData({ ...formData, toLat: parseFloat(e.target.value) })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Longitude *
            </label>
            <input
              type="number"
              step="any"
              value={formData.toLng}
              onChange={(e) => setFormData({ ...formData, toLng: parseFloat(e.target.value) })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parcel Size *
          </label>
          <select
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value as ParcelSize })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ParcelSize.SMALL}>Small (fits in bag)</option>
            <option value={ParcelSize.MEDIUM}>Medium (small box)</option>
            <option value={ParcelSize.LARGE}>Large (large box)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What are you sending?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reward Amount (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.rewardAmount}
            onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="10.00"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desired Pickup Date *
            </label>
            <input
              type="datetime-local"
              value={formData.desiredPickupDate}
              onChange={(e) => setFormData({ ...formData, desiredPickupDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desired Delivery Date *
            </label>
            <input
              type="datetime-local"
              value={formData.desiredDeliveryDate}
              onChange={(e) => setFormData({ ...formData, desiredDeliveryDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Parcel Request'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


