import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { RequestOrderValidationPipe } from './pipes/validation/request-order-validation.pipe';
import { OrderService } from './order.service';
import { CreateOrderValidationPipe } from './pipes/validation/create-order-validation.pipe';
import { UpdateOrderValidationPipe } from './pipes/validation/update-order-validation.pipe';
import { RequestOrderDto } from './dtos/request-order.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UseRole } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('order')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseRole(Role.Admin, Role.Vendor, Role.User)
  create(@Body(CreateOrderValidationPipe) dto: CreateOrderDto, @Request() req: Request) {
    return this.orderService.create(req, dto);
  }


  @Post('order/archives')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseRole(Role.Admin, Role.Vendor)
  findArchive(@Body(RequestOrderValidationPipe) dto: RequestOrderDto, @Request() req: Request) {
    return this.orderService.findArchive(req, dto);
  }

  @Get('order/:id')
  @UseGuards(JwtAuthGuard)
  @UseRole(Role.Admin, Role.Vendor, Role.User)
  findOne(@Param('id') id: string, @Request() req: Request) {
    return this.orderService.findOne(id);
  }


  @Patch('order/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseRole(Role.Admin, Role.User, Role.User)
  update(
    @Param('id') id: string,
    @Body(UpdateOrderValidationPipe) dto: UpdateOrderDto,
    @Request() req: Request
  ) {
    return this.orderService.update(id, req, dto);
  }

  @Delete('order/archives/delete/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseRole(Role.Admin)
  delete(@Param('id') id: string, @Request() req: Request) {
    return this.orderService.delete(id, req);
  }



  @Post('orders')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseRole(Role.Admin, Role.Vendor)
  findAll(@Body(RequestOrderValidationPipe) dto: RequestOrderDto, @Request() req: Request) {
    return this.orderService.findAll(req, dto);
  }
  

  @Delete('order/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseRole(Role.Admin, Role.Vendor, Role.User)
  archive(@Param('id') id: string, @Request() req: Request) {
    console.log("hello archive")
    return this.orderService.archive(id, req);
  }


  @Post('order/archives/restore/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @UseRole(Role.Admin, Role.Vendor)
  @UseRole(Role.Admin)
  restore(@Param('id') id: string, @Request() req: Request) {
    return this.orderService.restore(id, req);
  }
}