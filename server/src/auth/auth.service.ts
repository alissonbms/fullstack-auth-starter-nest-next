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
        this.tokenService.generateConfirmationToken(tokenPayload);

      const confirmLink = `${this.customConfigService.getServerUrl()}/auth/confirm-email?token=${token}`;

      await this.mailerService.sendEmailConfirmation(
        newUser.username,
        newUser.email,
        confirmLink,
        "verify-email",
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
      const payload: { sub: string } = this.tokenService.verifyToken(
        token,
        this.customConfigService.getJwtConfirmationSecret(),
      );

      await this.userService.markEmailAsVerified(payload.sub);

      return { message: "Email successfully confirmed" };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
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

  login(user: User, response: Response) {
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        "Please verify your email before logging in.",
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
}
