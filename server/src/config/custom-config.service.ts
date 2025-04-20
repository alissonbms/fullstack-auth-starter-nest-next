import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CustomConfigService {
  constructor(private readonly configService: ConfigService) {}

  getNodeEnv(): "development" | "production" | "test" | "provision" {
    return this.configService.getOrThrow<
      "development" | "production" | "test" | "provision"
    >("NODE_ENV");
  }

  getPort(): number {
    return this.configService.getOrThrow<number>("PORT");
  }

  getDatabaseUrl(): string {
    return this.configService.getOrThrow<string>("DATABASE_URL");
  }

  getClientUrl(): string {
    return this.configService.getOrThrow<string>("CLIENT_URL");
  }

  getServerUrl(): string {
    return this.configService.getOrThrow<string>("SERVER_URL");
  }

  getMailHost(): string {
    return this.configService.getOrThrow<string>("MAIL_HOST");
  }

  getMailPort(): number {
    return this.configService.getOrThrow<number>("MAIL_PORT");
  }

  getMailUser(): string {
    return this.configService.getOrThrow<string>("MAIL_USER");
  }

  getMailPass(): string {
    return this.configService.getOrThrow<string>("MAIL_PASS");
  }

  getMailFrom(): string {
    return this.configService.getOrThrow<string>("MAIL_FROM");
  }

  getJwtAccessExpiration(): string {
    return this.configService.getOrThrow<string>("JWT_ACCESS_EXPIRATION");
  }

  getJwtAccessSecret(): string {
    return this.configService.getOrThrow<string>("JWT_ACCESS_SECRET");
  }

  getJwtConfirmEmailSecret(): string {
    return this.configService.getOrThrow<string>("JWT_CONFIRM_EMAIL_SECRET");
  }

  getJwtResetPasswordSecret(): string {
    return this.configService.getOrThrow<string>("JWT_RESET_PASSWORD_SECRET");
  }
}
