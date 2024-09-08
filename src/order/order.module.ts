import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig } from 'src/config/jwt.config';
import { Product } from 'src/product/entities/product.entity';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product]),
    JwtModule.registerAsync(jwtConfig)
  ],
  providers: [OrderService],
  controllers: [OrderController]
})
export class OrderModule {}
