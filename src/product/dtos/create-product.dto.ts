import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Category } from 'src/common/enums/category.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  price: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  stockQuantity: number;

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
