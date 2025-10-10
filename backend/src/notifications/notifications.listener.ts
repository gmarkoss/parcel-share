import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('parcel.accepted')
  async handleParcelAccepted(payload: any) {
    const { parcel, carrierId } = payload;

    // Notify parcel sender
    await this.notificationsService.create(
      parcel.senderId,
      NotificationType.PARCEL_ACCEPTED,
      `Your parcel from ${parcel.fromLocation} to ${parcel.toLocation} has been accepted!`,
      { parcelId: parcel.id, carrierId },
    );

    // Notify carrier
    await this.notificationsService.create(
      carrierId,
      NotificationType.PARCEL_ACCEPTED,
      `You accepted a parcel from ${parcel.fromLocation} to ${parcel.toLocation}`,
      { parcelId: parcel.id },
    );
  }

  @OnEvent('parcel.status.changed')
  async handleParcelStatusChanged(payload: any) {
    const { parcel, oldStatus, newStatus } = payload;

    // Notify sender
    await this.notificationsService.create(
      parcel.senderId,
      NotificationType.PARCEL_STATUS_CHANGED,
      `Your parcel status changed from ${oldStatus} to ${newStatus}`,
      { parcelId: parcel.id, oldStatus, newStatus },
    );

    // Notify carrier if exists
    if (parcel.carrierId) {
      await this.notificationsService.create(
        parcel.carrierId,
        NotificationType.PARCEL_STATUS_CHANGED,
        `Parcel status changed from ${oldStatus} to ${newStatus}`,
        { parcelId: parcel.id, oldStatus, newStatus },
      );
    }
  }

  @OnEvent('trip.status.changed')
  async handleTripStatusChanged(payload: any) {
    const { trip, oldStatus, newStatus } = payload;

    // Notify trip owner
    await this.notificationsService.create(
      trip.travelerId,
      NotificationType.TRIP_STATUS_CHANGED,
      `Your trip status changed from ${oldStatus} to ${newStatus}`,
      { tripId: trip.id, oldStatus, newStatus },
    );
  }
}

