import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import configs from './configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Fix BigInt to Number
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors({
    origin: process.env.WHITE_LIST_URL.split(','),
  });

  // Setup swagger docs
  if (process.env.NODE_ENV != 'production') {
    const config = new DocumentBuilder()
      .setTitle(configs.appName)
      .setDescription(configs.appDescription)
      .setVersion(configs.appVersion)
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    // Import to postman
    SwaggerModule.setup('swagger', app, document, {
      customCss: '.topbar{display: none !important;}',
      swaggerOptions: {
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
