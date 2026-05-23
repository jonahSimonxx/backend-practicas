import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe with transform enabled (needed for @Type(() => Number), etc.)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Backend Prácticas')
    .setDescription('API para gestión de estrategias, demanda, inventario y recursos')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('Estrategia')
    .addTag('Demanda')
    .addTag('Inventario')
    .addTag('Recurso')
    .addTag('Almacen')
    .addTag('CalculoEstrategia')
    .addTag('Producto')
    .addTag('DetalleCalculoRecurso')
    .addTag('RelacionProductoRecurso')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
