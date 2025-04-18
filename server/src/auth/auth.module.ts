import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";

@Module({
  providers: [AuthModule],
  controllers: [AuthController],
})
export class AuthModule {}
