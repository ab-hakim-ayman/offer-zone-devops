import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModuleAsyncOptions } from "@nestjs/jwt";

export let jwtConfig:JwtModuleAsyncOptions = {
    imports:[ConfigModule],
    useFactory:(configService:ConfigService)=>({
        secret:process.env.JWT_SECRET,
        signOptions:{
            expiresIn:process.env.JWT_EXPIRES_IN
        }
    }),
    inject:[ConfigService]
}