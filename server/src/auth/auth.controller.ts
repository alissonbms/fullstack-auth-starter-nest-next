import { Body, Controller, Post, Query, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "generated/prisma";
import { Response } from "express";
import { CreateUserDto } from "src/user/dtos/create-user.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() dto: CreateUserDto) {
    return await this.authService.signup(dto);
  }

  @Post("confirm-email")
  async confirmEmail(@Query("token") token: string) {
    return await this.authService.confirmEmail(token);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }
}
