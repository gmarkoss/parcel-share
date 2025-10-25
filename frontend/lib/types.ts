export enum ParcelStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum ParcelSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum TransportType {
  CAR = 'car',
  BUS = 'bus',
  TRAIN = 'train',
}

export enum TripStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Parcel {
  id: string;
  fromLocation: string;
  toLocation: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  size: ParcelSize;
  description?: string;
  rewardAmount?: number;
  desiredPickupDate: string;
  desiredDeliveryDate: string;
  status: ParcelStatus;
  sender: User;
  senderId: string;
  carrier?: User;
  carrierId?: string;
  tripId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  fromLocation: string;
  toLocation: string;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  transportType: TransportType;
  departureTime: string;
  arrivalTime: string;
  availableCapacity: number;
  notes?: string;
  status: TripStatus;
  traveler: User;
  travelerId: string;
  parcels?: Parcel[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface MatchResult {
  trip: Trip;
  parcel: Parcel;
  matchScore: number;
  distanceMatch: boolean;
  timeMatch: boolean;
}


