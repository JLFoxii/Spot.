import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService) {}

  @Get('slots') // Public endpoint
  async getSlots(
    @Query('businessId') businessId: string,
    @Query('staffId') staffId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string, // YYYY-MM-DD
  ) {
    return this.service.getAvailableSlots(businessId, staffId, serviceId, date);
  }
}
