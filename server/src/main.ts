import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import { ValidationPipe } from "@nestjs/common";
import { CustomConfigService } from "./config/custom-config.service";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use(cookieParser());

  app.setGlobalPrefix("api");

  const customConfigService = app.get(CustomConfigService);
  const port = customConfigService.getPort();

  app.enableCors({
    origin: [customConfigService.getClientUrl()],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-SUPPRESS-TOAST"],
  });

  await app.listen(port);
}
void bootstrap();
