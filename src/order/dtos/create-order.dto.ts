import { IsString, IsArray, ValidateNested, IsEnum, IsNumber, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ProductInOrder } from '../entities/product-in-order.entity';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductInOrder)
  products: ProductInOrder[];

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
