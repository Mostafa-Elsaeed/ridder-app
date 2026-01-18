
import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll() {
    return this.ordersService.findAll(); // Implementation assumed in service
  }

  @Post()
  async create(@Body() createOrderDto: any, @Request() req) {
    // In a real app, get storeId from JWT req.user
    return this.ordersService.create(createOrderDto);
  }

  @Post(':id/accept-bid')
  async acceptBid(@Param('id') id: string, @Body('bidId') bidId: string) {
    return this.ordersService.acceptBid(id, bidId);
  }

  @Post(':id/deposit')
  async deposit(@Param('id') id: string, @Body('userId') userId: string) {
    return this.ordersService.depositFunds(id, userId);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/confirm-receipt')
  async confirmReceipt(@Param('id') id: string, @Body('storeId') storeId: string) {
    return this.ordersService.confirmReceipt(id, storeId);
  }
}
