import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { HashService } from "src/encryption/hash.service";
import { CustomConfigService } from "src/config/custom-config.service";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { MailerService } from "src/mailer/mailer.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { TokenService } from "./token.service";
import { JwtModule } from "@nestjs/jwt";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";

@Module({
  imports: [JwtModule.register({}), CloudinaryModule],
  providers: [
    AuthService,
    CustomConfigService,
    UserService,
    HashService,
    LocalStrategy,
    JwtStrategy,
    MailerService,
    TokenService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
