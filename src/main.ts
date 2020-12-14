import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
const port = process.env.PORT || 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors();
  const options = new DocumentBuilder()
    .setTitle('The Career Network API Documentation')
    .setDescription('The Career Network API Documentation description')
    .setVersion('3.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(port);
  Logger.log(`Server running on htttp://localhost:${port}`);
}
bootstrap();
