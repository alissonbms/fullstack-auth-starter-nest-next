import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "generated/prisma";
import { Response } from "express";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { TokenPayload } from "./interfaces/token-payload.interface";
import { CustomConfigService } from "src/config/custom-config.service";
import { EmailDto } from "./dtos/email.dto";
import { PasswordDto } from "./dtos/password.dto";
import { ChangeEmailDto } from "./dtos/changeEmail.dto";
import { ChangePasswordDto } from "./dtos/changePassword.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly customConfigService: CustomConfigService,
  ) {}

  @Post("signup")
  async signup(@Body() dto: CreateUserDto) {
    return await this.authService.signup(dto);
  }

  @Patch("confirm-email")
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

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie("Authentication", "", {
      secure: true,
      httpOnly: true,
      sameSite:
        this.customConfigService.getNodeEnv() === "development"
          ? "lax"
          : "strict",
      expires: new Date(0),
      path: "/",
    });

    return { message: "Logout successful." };
  }

  @Post("forgot-password")
  forgotPassword(@Body() emailDto: EmailDto) {
    return this.authService.forgotPassword(emailDto);
  }

  @Patch("reset-password")
  resetPassword(
    @Query("token") token: string,
    @Body() passwordDto: PasswordDto,
  ) {
    return this.authService.resetPassword(token, passwordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("change-email-request")
  changeEmailRequest(
    @CurrentUser() userId: TokenPayload,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    return this.authService.changeEmailRequest(userId, changeEmailDto);
  }
  @UseGuards(JwtAuthGuard)
  @Patch("change-email-confirm")
  changeEmailConfirm(
    @CurrentUser() userId: TokenPayload,
    @Query("token") token: string,
  ) {
    return this.authService.changeEmailConfirm(userId, token);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("change-password")
  changePassword(
    @CurrentUser() userId: TokenPayload,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMe(@CurrentUser() user: TokenPayload) {
    return user;
  }
}
