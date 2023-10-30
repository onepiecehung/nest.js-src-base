import * as morgan from 'morgan';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.enableCors();
  app.setGlobalPrefix('api');
  app.use(morgan('dev'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (process.env.NODE_ENV == 'development') {
    const config = new DocumentBuilder()
      .setTitle('Documentation for APIs')
      .setDescription('Documentation for APIs')
      .setVersion('1.0')
      .addBearerAuth(
        {
          description: `Please enter token`,
          name: 'Authorization',
          bearerFormat: 'Bearer',
          scheme: 'Bearer',
          type: 'http',
          in: 'Header',
        },
        'accessToken',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
  await Promise.all([app.startAllMicroservices(), app.listen(port)]);
}
bootstrap();
