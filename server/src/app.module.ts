import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";
import { validate } from "./config/env.validation";
import { CustomConfigModule } from "./config/custom-config.module";
import { CustomConfigService } from "./config/custom-config.service";
import { UserModule } from "./user/user.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { PrismaModule } from "./prisma/prisma.module";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    CustomConfigModule,
    LoggerModule.forRootAsync({
      imports: [CustomConfigModule],
      useFactory: (customConfigService: CustomConfigService) => {
        const isProduction = customConfigService.getNodeEnv() === "production";
        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: "pino-pretty",
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? "info" : "debug",
          },
        };
      },
      inject: [CustomConfigService],
    }),
    PrismaModule,
    MailerModule.forRootAsync({
      imports: [CustomConfigModule],
      useFactory: (customConfigService: CustomConfigService) => {
        return {
          transport: {
            host: customConfigService.getMailHost(),
            port: customConfigService.getMailPort(),
            secure: false,
            auth: {
              user: customConfigService.getMailUser(),
              pass: customConfigService.getMailPass(),
            },
          },
          defaults: {
            from: customConfigService.getMailFrom(),
          },
          template: {
            dir: join(process.cwd(), "src", "mailer", "templates"),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
      inject: [CustomConfigService],
    }),
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
