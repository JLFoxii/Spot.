import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateBookingDto } from '@spot-monorepo/shared-dtos';
import { CurrentUser } from '../auth/current-user.decorator';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: { id: string; email: string; role: string }
  ) {
    const booking = await this.bookingService.createBooking(createBookingDto, user.id);
    await this.bookingService.sendBookingNotification(booking);
    return booking;
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyBookings(@CurrentUser() user: { id: string }) {
    return this.bookingService.getMyBookings(user.id);
  }

  @Get('range')
  async getBookingsByRange(
    @Query('businessId') businessId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.bookingService.findRangeForBusiness(businessId, start, end);
  }
}
