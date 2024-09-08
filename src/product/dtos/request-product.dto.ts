import { IsNumber, IsObject, IsOptional } from 'class-validator';

export class RequestProductDto {
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 100;

  @IsOptional()
  @IsObject()
  query?: Record<string, any> = {};
}
