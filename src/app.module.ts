import { redisStore } from 'cache-manager-redis-store';

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config, configValidationSchema } from './config/config';
import { DatabaseConfig } from './config/database.config';
import { HttpExceptionFilter } from './utils/exceptions/http-exception.filter';
import { TransformInterceptor } from './utils/interceptors/transform.interceptor';

import type { ClientOpts } from 'redis';
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configValidationSchema,
      cache: true,
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),
    CacheModule.register<ClientOpts>({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          url: configService.get('REDIS_URL'),
          ttl: 60,
          password: process.env.REDIS_PASSWORD,
        });
        return {
          store: () => store,
        };
      },

      // Store-specific configuration:

      // host: process.env.REDIS_HOST,
      // port: process.env.REDIS_PORT,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
