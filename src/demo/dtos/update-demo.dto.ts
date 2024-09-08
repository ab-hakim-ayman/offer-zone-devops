import { IsOptional, IsString } from 'class-validator';

export class UpdateDemoDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
