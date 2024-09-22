import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsNotEmpty, IsEnum } from 'class-validator';
import { Categories } from 'src/common/enums/categories.enum';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Categories)
  @IsOptional()
  category?: Categories;

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
}
