import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { JwtModule } from "@nestjs/jwt";
import { CustomConfigModule } from "src/config/custom-config.module";
import { CustomConfigService } from "src/config/custom-config.service";
import { PrismaService } from "src/prisma/prisma.service";
import { HashService } from "src/encryption/hash.service";
import { MailerService } from "src/mailer/mailer.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [CustomConfigModule],
      useFactory: (customConfigService: CustomConfigService) => {
        return {
          secret: customConfigService.getJwtConfirmationSecret(),
          signOptions: { expiresIn: "1h" },
        };
      },
      inject: [CustomConfigService],
    }),
  ],
  providers: [UserService, PrismaService, HashService, MailerService],
  controllers: [UserController],
})
export class UserModule {}
