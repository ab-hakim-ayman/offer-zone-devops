import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { ConfigService, ConfigModule } from "@nestjs/config";

export let typeOrmMongoConfig:TypeOrmModuleAsyncOptions ={
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mongodb',
    url: configService.get<string>('MONGO_DB_URI'),
    useUnifiedTopology: true,
    host: configService.get('MONGO_DB_HOST') || 'mongo',
    port: +configService.get('MONGO_DB_PORT') || 27017,
    username: configService.get('MONGO_DB_USERNAME') || '',
    password: configService.get('MONGO_DB_PASSWORD') || '',
    database: configService.get('MONGO_DB_DATABASE_NAME') || 'oz',
    authSource:'admin',
    entities: [__dirname+"./../**/entities/*.entity{.ts,.js}"],
    subscribers:[__dirname+"./../**/*.subscriber{.ts,.js}"],
    synchronize: true, 
  }),
  inject: [ConfigService],
}
