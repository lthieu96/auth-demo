import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { LocalStrategy } from './strategies/local.strategy';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RedisModule } from '@nestjs-modules/ioredis';
import redisConfig from 'src/config/redis.config';
import { RefreshTokenIdsStorage } from './storage/refresh-token-ids.storage';
import { RolesGuard } from 'src/authorization/guards/roles.guard';
import { GoogleService } from './social/google.service';
import { GoogleController } from './social/google.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    RedisModule.forRootAsync({
      imports: [ConfigModule.forFeature(redisConfig)],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: `rediss://default:${config.get('redis.password')}@${config.get('redis.host')}:6379`,
      }),
    }),
  ],
  controllers: [AuthController, GoogleController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ConfigService,
    RefreshTokenIdsStorage,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    GoogleService,
  ],
})
export class AuthModule {}
