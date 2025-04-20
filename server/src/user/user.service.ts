import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "generated/prisma/runtime/library";

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
}
