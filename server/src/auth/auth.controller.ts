import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { Response } from "express";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { TokenPayload } from "./interfaces/token-payload.interface";
import { CustomConfigService } from "src/config/custom-config.service";
import { EmailDto } from "./dtos/email.dto";
import { PasswordDto } from "./dtos/password.dto";
import { ChangeEmailDto } from "./dtos/changeEmail.dto";
import { ChangePasswordDto } from "./dtos/changePassword.dto";
import { Public } from "src/common/decorators/public.decorator";
import { UserService } from "src/user/user.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { User } from "generated/prisma";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly customConfigService: CustomConfigService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post("signup")
  @UseInterceptors(
    FileInterceptor("profileImage", {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const isValid = ["image/jpeg", "image/png"].includes(file.mimetype);

        if (!isValid) {
          return cb(
            new BadRequestException("Only JPEG or PNG images are allowed."),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async signup(
    @Body() dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.authService.signup(dto, file);
  }

  @Public()
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

  @UseGuards(JwtAuthGuard)
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

  @Public()
  @Post("forgot-password")
  forgotPassword(@Body() emailDto: EmailDto) {
    return this.authService.forgotPassword(emailDto);
  }

  @Public()
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
  @Get("session")
  getSession(@CurrentUser() user: TokenPayload) {
    return this.userService.getUser({ id: user.sub });
  }
}
