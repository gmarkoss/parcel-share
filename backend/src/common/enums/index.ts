// User enums (none currently, but keeping for future use)

// Parcel enums
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

// Trip enums
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

// Match enums
export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Review enums
export enum ReviewType {
  SENDER_TO_TRAVELER = 'sender_to_traveler',
  TRAVELER_TO_SENDER = 'traveler_to_sender',
}

