import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { HashService } from "src/encryption/hash.service";
import { JwtService } from "@nestjs/jwt";
import { CustomConfigService } from "src/config/custom-config.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { MailerService } from "src/mailer/mailer.service";

@Module({
  imports: [],
  providers: [
    AuthService,
    PrismaService,
    JwtService,
    CustomConfigService,
    UserService,
    HashService,
    LocalStrategy,
    MailerService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
