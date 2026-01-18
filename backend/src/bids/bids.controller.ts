
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { BidsService } from './bids.service';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  async placeBid(@Body() bidData: any) {
    return this.bidsService.create(bidData);
  }

  @Get(':orderId')
  async getByOrder(@Param('orderId') orderId: string) {
    return this.bidsService.findByOrder(orderId);
  }
}
