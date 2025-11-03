import { Parcel, Trip, ParcelStatus, TripStatus } from '@/lib/types';
import { TabFilter } from '@/components/StatusTab';

export function isParcelActive(parcel: Parcel): boolean {
  return (
    parcel.status === ParcelStatus.REQUESTED ||
    parcel.status === ParcelStatus.ACCEPTED ||
    parcel.status === ParcelStatus.IN_TRANSIT
  );
}

export function isParcelCompleted(parcel: Parcel): boolean {
  return parcel.status === ParcelStatus.DELIVERED;
}

export function isTripActive(trip: Trip): boolean {
  return trip.status === TripStatus.PLANNED || trip.status === TripStatus.IN_PROGRESS;
}

export function isTripCompleted(trip: Trip): boolean {
  return trip.status === TripStatus.COMPLETED;
}

export function isParcelFuture(parcel: Parcel): boolean {
  const pickupDate = new Date(parcel.desiredPickupDate);
  const now = new Date();
  return pickupDate > now;
}

export function isTripFuture(trip: Trip): boolean {
  const departureTime = new Date(trip.departureTime);
  const now = new Date();
  return departureTime > now;
}

export function isParcelPast(parcel: Parcel): boolean {
  const pickupDate = new Date(parcel.desiredPickupDate);
  const now = new Date();
  return pickupDate <= now;
}

export function isTripPast(trip: Trip): boolean {
  const departureTime = new Date(trip.departureTime);
  const now = new Date();
  return departureTime <= now;
}

export function filterParcels(parcels: Parcel[], filter: TabFilter): Parcel[] {
  switch (filter) {
    case 'active':
      // Active AND future items
      return parcels.filter((p) => isParcelActive(p) && isParcelFuture(p));
    case 'past':
      // Active BUT past items (not completed, but in the past)
      return parcels.filter((p) => isParcelActive(p) && isParcelPast(p));
    case 'completed':
      return parcels.filter(isParcelCompleted);
    case 'all':
    default:
      return parcels;
  }
}

export function filterTrips(trips: Trip[], filter: TabFilter): Trip[] {
  switch (filter) {
    case 'active':
      // Active AND future items
      return trips.filter((t) => isTripActive(t) && isTripFuture(t));
    case 'past':
      // Active BUT past items (not completed, but in the past)
      return trips.filter((t) => isTripActive(t) && isTripPast(t));
    case 'completed':
      return trips.filter(isTripCompleted);
    case 'all':
    default:
      return trips;
  }
}

export function getParcelCounts(parcels: Parcel[]) {
  return {
    active: parcels.filter((p) => isParcelActive(p) && isParcelFuture(p)).length,
    past: parcels.filter((p) => isParcelActive(p) && isParcelPast(p)).length,
    completed: parcels.filter(isParcelCompleted).length,
    all: parcels.length,
  };
}

export function getTripCounts(trips: Trip[]) {
  return {
    active: trips.filter((t) => isTripActive(t) && isTripFuture(t)).length,
    past: trips.filter((t) => isTripActive(t) && isTripPast(t)).length,
    completed: trips.filter(isTripCompleted).length,
    all: trips.length,
  };
}

