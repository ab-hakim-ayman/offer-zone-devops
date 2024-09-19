import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { ConfigService,ConfigModule } from "@nestjs/config/dist";

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    cors:true
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  console.log(__dirname);
  
  app.use(express.static(join(__dirname, '..', 'public')));
  await app.listen(3000);
}
bootstrap();
