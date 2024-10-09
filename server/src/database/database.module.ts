import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get('database.host'),
          port: config.get('database.port'),
          database: config.get('database.database'),
          username: config.get('database.username'),
          password: config.get('database.password'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class DatabaseModule {}
