import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class EmailVerificationDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email?: string;
}