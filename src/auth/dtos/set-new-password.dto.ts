import { IsOptional, IsString, MinLength } from "class-validator";

export class SetNewPasswordDto {
    @IsOptional()
    @IsString()
    resetToken: string;
  
    @IsString()
    @MinLength(8)
    newPassword: string;
  }