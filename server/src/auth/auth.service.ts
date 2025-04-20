import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { CustomConfigService } from "src/config/custom-config.service";
import { UserService } from "src/user/user.service";
import { HashService } from "src/encryption/hash.service";
import { TokenPayload } from "./interfaces/token-payload.interface";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import { TokenService } from "./token.service";
import { MailerService } from "src/mailer/mailer.service";
import { User } from "generated/prisma";
import { Response } from "express";
import * as ms from "ms";
import { EmailDto } from "./dtos/email.dto";
import { PasswordDto } from "./dtos/password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly customConfigService: CustomConfigService,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(data: CreateUserDto) {
    try {
      const newUser = await this.userService.createUser({
        ...data,
        password: await this.hashService.hash(data.password),
      });

      const tokenPayload: TokenPayload = {
        sub: newUser.id,
      };

      const { token } =
        this.tokenService.generateConfirmEmailToken(tokenPayload);

      const confirmLink = `${this.customConfigService.getServerUrl()}/auth/confirm-email?token=${token}`;

      await this.mailerService.sendEmailConfirmation(
        newUser.username,
        newUser.email,
        confirmLink,
        "first_email_confirmation",
      );

      return {
        message: `User ${newUser.username} created, we sent a message to your email: ${newUser.email}, please confirm!`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }

  async confirmEmail(token: string) {
    try {
      const payload: TokenPayload = this.tokenService.verifyToken(
        token,
        this.customConfigService.getJwtConfirmEmailSecret(),
      );

      await this.userService.markEmailAsVerified(payload.sub);

      return { message: "Email successfully confirmed" };
    } catch (error) {
      if (error) {
        throw new UnauthorizedException("Token invalid or expired!");
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException("Something went wrong!");
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUserByEmail(email);

      const isValid =
        user && (await this.hashService.compare(password, user.password));

      if (!isValid) {
        throw new UnauthorizedException("Invalid credentials.");
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException("Invalid credentials.");
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async login(user: User, response: Response) {
    if (!user.emailVerified) {
      const tokenPayload: TokenPayload = {
        sub: user.id,
      };

      const { token } =
        this.tokenService.generateConfirmEmailToken(tokenPayload);

      const confirmLink = `${this.customConfigService.getServerUrl()}/auth/confirm-email?token=${token}`;

      await this.mailerService.sendEmailConfirmation(
        user.username,
        user.email,
        confirmLink,
        "first_email_confirmation",
      );

      throw new UnauthorizedException(
        "Please verify your email before logging in, we sent a message there.",
      );
    }

    const tokenPayload: TokenPayload = {
      sub: user.id,
    };

    const { token, expiresIn } =
      this.tokenService.generateAccessToken(tokenPayload);

    const expires = new Date(Date.now() + ms(expiresIn));

    response.cookie("Authentication", token, {
      secure: true,
      httpOnly: true,
      sameSite:
        this.customConfigService.getNodeEnv() === "development"
          ? "lax"
          : "strict",
      expires,
      path: "/",
    });

    return {
      message: "Login successful.",
    };
  }

  async forgotPassword(emailDto: EmailDto) {
    const email = emailDto.value;
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new BadRequestException("User not found.");
    }

    const tokenPayload: TokenPayload = {
      sub: user.id,
    };

    const { token } =
      this.tokenService.generateResetPasswordToken(tokenPayload);

    const resetLink = `${this.customConfigService.getServerUrl()}/auth/reset-password?token=${token}`;

    await this.mailerService.sendPasswordReset(user.username, email, resetLink);

    return {
      message: `We sent a message to your email: ${email}, please confirm to change your password!`,
    };
  }

  async resetPassword(token: string, passwordDto: PasswordDto) {
    const payload: TokenPayload = this.tokenService.verifyToken(
      token,
      this.customConfigService.getJwtResetPasswordSecret(),
    );

    const hasedPassword = await this.hashService.hash(passwordDto.value);

    await this.userService.changePassword(payload.sub, hasedPassword);

    return {
      message: "Password changed successfully",
    };
  }
}
