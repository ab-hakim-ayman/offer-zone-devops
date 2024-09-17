import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()  
  price?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()  
  stockQuantity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
