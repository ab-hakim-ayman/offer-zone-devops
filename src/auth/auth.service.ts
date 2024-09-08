import {
  Injectable,
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { ObjectId } from 'mongodb';
import { Roles } from 'src/common/enums/roles.enum';
import { GenericRepository } from 'src/common/utils/generic-repository';
import { User } from 'src/user/entities/user.entity';
import {
  AdminUserDetailSerializer,
  AdminUserListSerializer,
  UserDetailSerializer,
  UserListSerializer,
  VendorUserDetailSerializer,
  VendorUserListSerializer,
} from 'src/user/user.serializer';
import { Repository, Auth, QueryFailedError } from 'typeorm';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { randomBytes } from 'crypto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SetNewPasswordDto } from './dtos/set-new-password.dto';

@Injectable()
export class AuthService {
  private collection = 'User';
  private genericRepository: GenericRepository;
  private blacklistedTokens = new Set<string>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.genericRepository = new GenericRepository(
      this.userRepository,
      UserDetailSerializer,
      UserListSerializer,
      AdminUserDetailSerializer,
      AdminUserListSerializer,
      VendorUserDetailSerializer,
      VendorUserListSerializer,
    );
  }

  async signUp(
    dto: SignUpDto,
    isAdmin: boolean = false,
    isVendor: boolean = false,
  ): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('A user with this email already exists');
      }

      const { password, ...otherDetails } = dto;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = this.userRepository.create({
        ...otherDetails,
        password: hashedPassword,
        role: isAdmin ? Roles.Admin : isVendor ? Roles.Vendor : Roles.User,
      });

      const savedUser = await this.userRepository.save(user);

      return {
        data: savedUser,
        message: 'User successfully signed up',
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Failed to create the user due to a database error',
        );
      } else if (error instanceof TypeError) {
        throw new BadRequestException('Invalid data provided');
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred during signup',
        );
      }
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Email not found');
      }
      console.log(user);

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Incorrect password');
      }

      const payload = { email: user.email, sub: user._id, role: user.role };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '30min' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException('Invalid request data');
      } else {
        throw new Error('An unexpected error occurred during sign-in');
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      return {
        accessToken: this.jwtService.sign(
          { username: payload.username, sub: payload.sub, role: payload.role },
          { expiresIn: '15m' },
        ),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signOut(token: string): Promise<{ message: string }> {
    try {
      if (!this.isValidTokenFormat(token)) {
        throw new BadRequestException('Invalid token format');
      }

      try {
        this.jwtService.verify(token);
      } catch (error) {
        throw new BadRequestException('Token is invalid or expired');
      }

      this.blacklistedTokens.add(token);

      return { message: 'Successfully signed out' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred during sign out',
        );
      }
    }
  }

  async sendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Email not found');
      }

      const token = uuidv4();
      user.emailVerificationToken = token;
      user.emailVerificationTokenExpiry = new Date(Date.now() + 3600 * 1000);
      await this.userRepository.save(user);

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'abhakim.hstu@gmail.com',
          pass: 'qdre yhue pbcg nyfr',
        },
      });

      const mailOptions = {
        from: 'abhakim.hstu@gmail.com',
        to: email,
        subject: 'Email Verification',
        text: `To verify your email, please use the following link: 
          http://localhost:3000/auth/verify-email?token=${token}`,
      };

      await transporter.sendMail(mailOptions);

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while sending the verification email',
        );
      }
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { emailVerificationToken: token },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      if (user.emailVerificationTokenExpiry < new Date()) {
        throw new UnauthorizedException('Token has expired');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpiry = null;
      await this.userRepository.save(user);

      return { message: 'Email successfully verified' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while verifying the email',
        );
      }
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(userId) },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        console.log('Old password incorrect');
        throw new UnauthorizedException('Old password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await this.userRepository.save(user);

      return { message: 'Password successfully changed' };
    } catch (error) {
      console.error('Error occurred in changePassword:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while changing the password',
        );
      }
    }
  }

  async forgetPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Email not found');
      }

      const resetToken = uuidv4();
      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 3600 * 1000);
      await this.userRepository.save(user);

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'abhakim.hstu@gmail.com',
          pass: 'qdre yhue pbcg nyfr',
        },
      });

      const mailOptions = {
        from: 'abhakim.hstu@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `To reset your password, please use the following link: 
          http://localhost:3000/auth/set-new-password?token=${resetToken}`,
      };

      await transporter.sendMail(mailOptions);

      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while sending the password reset email',
        );
      }
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { email } = dto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const resetToken = uuidv4();
      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 3600000);
      await this.userRepository.save(user);

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'abhakim.hstu@gmail.com',
          pass: 'qdre yhue pbcg nyfr',
        },
      });

      await transporter.sendMail({
        to: user.email,
        from: 'abhakim.hstu@gmail.com',
        subject: 'Password Reset',
        text: `To reset your password, please use the following link: 
          http://localhost:3000/auth/set-new-password?token=${resetToken}`,
      });

      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }
  }

  async setNewPassword(dto: SetNewPasswordDto): Promise<any> {
    const resetToken = dto.resetToken;
    const user = await this.userRepository.findOne({ where: { resetToken } });

    if (!user || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    try {
      user.password = await bcrypt.hash(dto.newPassword, 10);
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await this.userRepository.save(user);

      return { message: 'Password has been successfully reset' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  private isValidTokenFormat(token: string): boolean {
    const tokenRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    return tokenRegex.test(token);
  }
}
