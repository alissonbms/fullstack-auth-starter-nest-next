import { Injectable } from "@nestjs/common";
import { MailerService as NestMailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendEmailConfirmation(
    username: string,
    email: string,
    confirmLink: string,
    origin: "verify-email" | "change-email",
  ) {
    const message =
      origin === "verify-email"
        ? "Please confirm your email by clicking the link below:"
        : "You have requested an email change. Please confirm by clicking the link below:";
    await this.mailerService.sendMail({
      to: email,
      subject:
        origin === "verify-email"
          ? "Confirm your email."
          : "Confirm email change.",
      template: "./confirm-email",
      context: { name: username, message, link: confirmLink },
    });
  }

  async sendPasswordReset(username: string, email: string, resetLink: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: "Reset you password.",
      template: "./reset-password",
      context: {
        name: username,
        message:
          "You have requested a password reset, please confirm by clicking the link below:",
        link: resetLink,
      },
    });
  }
}
