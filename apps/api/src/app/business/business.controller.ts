import { Controller, Get, Param } from '@nestjs/common';
import { BusinessService } from './business.service';

@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get(':slug')
  async getBusinessBySlug(@Param('slug') slug: string) {
    return this.businessService.findOneBySlug(slug);
  }
}
