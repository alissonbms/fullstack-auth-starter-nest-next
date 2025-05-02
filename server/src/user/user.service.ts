import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "generated/prisma/runtime/library";
import { Prisma } from "generated/prisma";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserDto) {
    try {
      return await this.prismaService.user.create({ data });
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new UnprocessableEntityException(
          "We couldn't process your request.",
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async getUser(
    filter: Prisma.UserWhereUniqueInput,
    withPassword: boolean = false,
  ) {
    const selectFields = {
      id: true,
      username: true,
      email: true,
      emailVerified: true,
      ...(withPassword && { password: true }),
    };
    return this.prismaService.user.findUniqueOrThrow({
      where: filter,
      select: selectFields,
    });
  }

  async markEmailAsVerified(id: string) {
    await this.prismaService.user.update({
      where: { id },
      data: { emailVerified: true },
    });
  }

  async changePassword(id: string, newPassword: string) {
    await this.prismaService.user.update({
      where: { id },
      data: {
        password: newPassword,
      },
    });
  }

  async changeEmail(id: string, newEmail: string) {
    await this.prismaService.user.update({
      where: { id },
      data: { email: newEmail, emailVerified: true },
    });
  }
}
