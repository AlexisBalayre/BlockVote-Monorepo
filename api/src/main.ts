import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/modules/app.module';
import { ConfigService } from '@nestjs/config';
import { EEnvKeys } from '@src/enums';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Instanciate the app
  const app = await NestFactory.create(AppModule);
  // Enable helmet, see https://helmetjs.github.io/
  app.use(helmet());
  // Enable morgan, see https://expressjs.com/en/resources/middleware/morgan.html
  app.use(morgan('combined'));
  // Enable cors, see https://docs.nestjs.com/security/cors + https://github.com/expressjs/cors#configuration-options
  app.enableCors({
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    allowedHeaders: 'Access-Control-Allow-Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
  });

  // structure a base document that conforms to the OpenAPI Specification
  const configService = app.get(ConfigService);
  // define swagger config
  const config = new DocumentBuilder()
    .setTitle('[API Name]')
    .setDescription('some description')
    .setVersion('1.0')
    // .addTag('some tag')
    .build();
  // Get a serializable object conforming to OpenAPI Document
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  // Expose the app
  await app.listen(String(configService.get<string>(EEnvKeys.PORT)));
  const logger = new Logger('Bootstrap');
  logger.debug('[API Name] Listening on port ' + String(configService.get<string>(EEnvKeys.PORT)));
}

bootstrap();
