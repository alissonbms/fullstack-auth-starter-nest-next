import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { MailerService as NestMailerService } from "@nestjs-modules/mailer";

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendEmailConfirmation(
    username: string,
    email: string,
    confirmLink: string,
    origin: "first_email_confirmation" | "confirm_email_change",
  ) {
    const message =
      origin === "first_email_confirmation"
        ? "Please confirm your email by clicking the link below:"
        : "You have requested an email change. Please confirm by clicking the link below:";

    try {
      await this.mailerService.sendMail({
        to: email,
        subject:
          origin === "first_email_confirmation"
            ? "Confirm your email."
            : "Confirm email change.",
        template: "./confirm-email",
        context: { name: username, message, link: confirmLink },
      });
    } catch (error) {
      if (error) {
        throw new InternalServerErrorException(
          "Failed to send confirmation email, please contact the support",
        );
      }
    }
  }

  async sendPasswordReset(username: string, email: string, resetLink: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: "Reset your password.",
        template: "./reset-password",
        context: {
          name: username,
          message:
            "You have requested a password reset, please confirm by clicking the link below:",
          link: resetLink,
        },
      });
    } catch (error) {
      if (error) {
        throw new InternalServerErrorException(
          "Failed to send reset password email, please contact the support",
        );
      }
    }
  }
}
