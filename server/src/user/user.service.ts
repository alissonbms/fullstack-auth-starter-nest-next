import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { HashService } from "src/encryption/hash.service";
import { PrismaClientKnownRequestError } from "generated/prisma/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "src/mailer/mailer.service";
import { CustomConfigService } from "src/config/custom-config.service";

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly customConfigService: CustomConfigService,
  ) {}

  async createUser(data: CreateUserDto) {
    try {
      const newUser = await this.prismaService.user.create({
        data: {
          ...data,
          password: await this.hashService.hash(data.password),
        },
      });

      const token = this.jwtService.sign(
        {
          sub: newUser.id,
        },
        { expiresIn: "1h" },
      );

      const confirmLink = `${this.customConfigService.getServerUrl()}/confirm-email?token=${token}`;

      await this.mailerService.sendEmailConfirmation(
        newUser.username,
        newUser.email,
        confirmLink,
        "verify-email",
      );

      return {
        message: `User ${newUser.username} created, we sent a message to your email: ${newUser.email}, please confirm!`,
      };
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new UnprocessableEntityException("Email already in use.");
      }
      throw new InternalServerErrorException();
    }
  }

  async getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }
}
