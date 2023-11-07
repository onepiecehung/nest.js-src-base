import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config, configValidationSchema } from './config/config';
import { HttpExceptionFilter } from './utils/exceptions/http-exception.filter';
import { TransformInterceptor } from './utils/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configValidationSchema,
      cache: true,
      isGlobal: true,
      load: [config],
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
