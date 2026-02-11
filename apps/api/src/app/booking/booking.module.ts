import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [
    // On déclare la queue pour pouvoir y injecter des jobs
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService, NotificationProcessor],
})
export class BookingModule {}
