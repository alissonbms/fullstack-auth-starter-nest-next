import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CustomConfigService {
  constructor(private readonly configService: ConfigService) {}

  getPort(): number {
    return this.configService.getOrThrow<number>("PORT");
  }

  getDatabaseUrl(): string {
    return this.configService.getOrThrow<string>("DATABASE_URL");
  }

  getNodeEnv(): "development" | "production" | "test" | "provision" {
    return this.configService.getOrThrow<
      "development" | "production" | "test" | "provision"
    >("NODE_ENV");
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
}
