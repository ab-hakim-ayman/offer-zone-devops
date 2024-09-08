import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Demo } from '../demo/entities/demo.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  url: process.env.DATABASE_URL,
  synchronize: true,
  useUnifiedTopology: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}']
};
