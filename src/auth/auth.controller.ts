import { BadRequestException, Body, Controller, Param, Patch, Post, Query, UnauthorizedException, UseGuards, Headers } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpValidationPipe } from './pipes/validation/sign-up-validation.pipe';
import { SignUpDto } from './dtos/sign-up.dto';
import { EmailVerificationDto } from './dtos/email-verification.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SetNewPasswordDto } from './dtos/set-new-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body(SignUpValidationPipe) dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('admin-sign-up')
  adminSignUp(@Body(SignUpValidationPipe) dto: SignUpDto) {
    return this.authService.signUp(dto, true, false);
  }

  @Post('vendor-sign-up')
  vendorSignUp(@Body(SignUpValidationPipe) dto: SignUpDto) {
    return this.authService.signUp(dto, false, true);
  }

  @Post('sign-in')
  signIn(@Body() dto: SignInDto) {
    const { email, password } = dto;
    return this.authService.signIn(email, password);
  }

  
  @Post('refresh-token')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(body.refreshToken);
  }

  
  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  signOut(@Headers('Authorization') authHeader: string) {
    const token = authHeader.split(' ')[1];
    return this.authService.signOut(token);
  }

  
  @Post('send-verification-email')
  @UseGuards(JwtAuthGuard)
  async sendVerificationEmail(@Body() dto: EmailVerificationDto) {
    const { email } = dto;
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    await this.authService.sendVerificationEmail(email);
    return { message: 'Verification email sent successfully' };
  }

  
  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  
  @Patch('change-password/:id')
  @UseGuards(JwtAuthGuard)
  changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
    const { oldPassword, newPassword } = dto;
    return this.authService.changePassword(id, oldPassword, newPassword);
  }

  
  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  @Post('forget-password')
  forgetPassword(@Body('email') email: string) {
    return this.authService.forgetPassword(email);
  }

  @Patch('set-new-password')
  async setNewPassword(
    @Body() dto: SetNewPasswordDto,
    @Query('token') queryToken?: string
  ) {
    if ( queryToken ) {
      const token = queryToken;
      
      if (token) {
        dto.resetToken = token
      } else {
        throw new BadRequestException('Token is required');
      }
    }

    return await this.authService.setNewPassword(dto);
  }
}
