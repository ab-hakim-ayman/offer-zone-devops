import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor, Roles.User)
  create(@Body(CreateOrderValidationPipe) dto: CreateOrderDto, @Request() req: Request) {
    return this.orderService.create(req, dto);
  }


  @Get('order/archives')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor)
  findArchive(@Body(RequestOrderValidationPipe) dto: RequestOrderDto, @Request() req: Request) {
    return this.orderService.findArchive(req, dto);
  }

  @Get('order/:id')
  @UseGuards(JwtAuthGuard)
  @UseRoles(Roles.Admin, Roles.Vendor, Roles.User)
  findOne(@Param('id') id: string, @Request() req: Request) {
    return this.orderService.findOne(id);
  }


  @Patch('order/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.User, Roles.User)
  update(
    @Param('id') id: string,
    @Body(UpdateOrderValidationPipe) dto: UpdateOrderDto,
    @Request() req: Request
  ) {
    return this.orderService.update(id, req, dto);
  }

  @Delete('order/archives/delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin)
  delete(@Param('id') id: string, @Request() req: Request) {
    return this.orderService.delete(id, req);
  }



  @Post('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor)
  findAll(@Body(RequestOrderValidationPipe) dto: RequestOrderDto, @Request() req: Request) {
    return this.orderService.findAll(req, dto);
  }


  @Delete('order/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor, Roles.User)
  archive(@Param('id') id: string, @Request() req: Request) {
    console.log("hello archive")
    return this.orderService.archive(id, req);
  }


  @Post('order/archives/restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseRoles(Roles.Admin, Roles.Vendor)
  @UseRoles(Roles.Admin)
  restore(@Param('id') id: string, @Request() req: Request) {
    return this.orderService.restore(id, req);
  }
}