import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { CustomConfigService } from "src/config/custom-config.service";
import { UserService } from "src/user/user.service";
import { HashService } from "src/encryption/hash.service";
import { Response } from "express";
import { User } from "generated/prisma";

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly customConfigService: CustomConfigService,
    private readonly userService: UserService,
    private readonly hashService: HashService,
  ) {}

  async confirmEmail(token: string) {
    try {
      const payload: { sub: string } = this.jwtService.verify(token, {
        secret: this.customConfigService.getJwtConfirmationSecret(),
      });

      await this.prismaService.user.update({
        where: {
          id: payload.sub,
        },
        data: {
          emailVerified: true,
        },
      });

      return { message: "Email successfully confirmed. You can login now." };
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

      if (!user) {
        throw new UnauthorizedException();
      }

      const passwordMatches = await this.hashService.compare(
        password,
        user.password,
      );

      if (!passwordMatches) {
        throw new UnauthorizedException();
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
    if (user && response) {
      return "Start login route";
    }
  }
}
