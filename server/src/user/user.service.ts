import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CreateUserDto } from "./dtos/create-user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { HashService } from "src/encryption/hash.service";
import { PrismaClientKnownRequestError } from "generated/prisma/runtime/library";

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async createUser(data: CreateUserDto) {
    try {
      const newUser = await this.prismaService.user.create({
        data: {
          ...data,
          password: await this.hashService.hash(data.password),
        },
      });
      return { message: `User ${newUser.username} created!` };
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
}
