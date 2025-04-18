import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { HashService } from "src/encryption/hash.service";

@Module({
  imports: [],
  providers: [UserService, PrismaService, HashService],
  controllers: [UserController],
})
export class UserModule {}
