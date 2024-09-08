import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RequestOrderValidationPipe } from './pipes/validation/request-order-validation.pipe';
import { OrderService } from './order.service';
import { CreateOrderValidationPipe } from './pipes/validation/create-order-validation.pipe';
import { UpdateOrderValidationPipe } from './pipes/validation/update-order-validation.pipe';
import { RequestOrderDto } from './dtos/request-order.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UseRoles } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/enums/roles.enum';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('order')
  @UseGuards(JwtAuthGuard)
  create(@Body(CreateOrderValidationPipe) dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }


  @Get('order/archives')
  @UseRoles(Roles.Admin, Roles.Vendor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findArchive() {
    return this.orderService.findArchive();
  }

  @Get('order/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }


  @Patch('order/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.User)
  update(
    @Param('id') id: string,
    @Body(UpdateOrderValidationPipe) dto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, dto);
  }

  @Delete('order/archives/delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin)
  delete(@Param('id') id: string) {
    return this.orderService.delete(id);
  }



  @Post('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Body(RequestOrderValidationPipe) dto: RequestOrderDto,) {
    return this.orderService.findAll(dto);
  }


  @Delete('order/:id')
  @UseRoles(Roles.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  archive(@Param('id') id: string) {
    return this.orderService.archive(id);
  }


  @Post('order/archives/restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin)
  restore(@Param('id') id: string) {
    return this.orderService.restore(id);
  }
}