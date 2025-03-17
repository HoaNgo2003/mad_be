import { VersioningType } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import * as path from 'path';
import * as express from 'express';
import { TransformInterceptor } from './common/intercepter/transform.interceptor';
import { CrudRequestInterceptor } from '@dataui/crud';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  await app.startAllMicroservices();

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  app.use(
    ['/swagger'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USERNAME]: process.env.SWAGGER_PASSWORD,
      },
    }),
  );

  app.enableCors();
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new CrudRequestInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
    }),
  );

  app.setViewEngine('ejs');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const options = new DocumentBuilder()
    .setTitle('NestJS backend app')
    .setDescription('Helpful')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      supportedSubmitMethods: ['get', 'post', 'patch', 'delete'],
      tryItOutEnabled: true,
    },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
