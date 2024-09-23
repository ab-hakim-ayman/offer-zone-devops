import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsNotEmpty, IsEnum } from 'class-validator';
import { Category } from 'src/common/enums/category.enum';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Category)
  @IsOptional()
  category?: Category;

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
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;
}
