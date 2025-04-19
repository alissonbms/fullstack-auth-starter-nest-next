import { Body, Controller, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "generated/prisma";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("confirm-email")
  async confirmEmail(@Body() body: { token: string }) {
    return await this.authService.confirmEmail(body.token);
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
