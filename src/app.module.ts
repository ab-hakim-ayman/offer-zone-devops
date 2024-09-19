import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DemoModule } from './demo/demo.module';
import { typeOrmMongoConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmMongoConfig),
    TypeOrmModule.forFeature([]),
    JwtModule.registerAsync(jwtConfig),
    AuthModule, 
    UserModule, 
    DemoModule, 
    ProductModule, 
    OrderModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
