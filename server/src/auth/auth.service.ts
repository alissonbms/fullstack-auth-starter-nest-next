import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { CustomConfigService } from "src/config/custom-config.service";
import { UserService } from "src/user/user.service";
import { HashService } from "src/encryption/hash.service";
import { TokenPayload } from "./interfaces/token-payload.interface";
import { CreateUserDto } from "src/user/dtos/create-user.dto";
import { TokenService } from "./token.service";
import { MailerService } from "src/mailer/mailer.service";
import { Response } from "express";
import * as ms from "ms";
import { EmailDto } from "./dtos/email.dto";
import { PasswordDto } from "./dtos/password.dto";
import { ChangeEmailDto } from "./dtos/changeEmail.dto";
import { ChangePasswordDto } from "./dtos/changePassword.dto";
import { TokenExpiredError } from "@nestjs/jwt";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import {
  ActionType,
  ChangeProfileImageDto,
} from "./dtos/change-profile-image.dto";
import { ChangeUsernameDto } from "./dtos/change-username.dto";
import { User } from "generated/prisma";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly hashService: HashService,
    private readonly customConfigService: CustomConfigService,
    private readonly mailerService: MailerService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(data: CreateUserDto, file: Express.Multer.File | undefined) {
    try {
      const response = file
        ? await this.cloudinaryService.upload(
            [file],
            `${this.customConfigService.getCloudinaryFolder()}/profile_images`,
          )
        : undefined;

      if (response?.success === false) {
        throw new BadRequestException(response.error);
      }

      const profileImage = response?.data?.[0]?.secure_url;

      const newUser = await this.userService.createUser({
        ...data,
        ...(profileImage && { profileImage }),
        password: await this.hashService.hash(data.password),
      });

      const tokenPayload: TokenPayload = {
        sub: newUser.id,
      };

      const { token } =
        this.tokenService.generateConfirmEmailToken(tokenPayload);

      const confirmLink = `${this.customConfigService.getServerUrl()}/auth/confirm-email?token=${token}`;

      await this.mailerService.sendEmailConfirmation(
        newUser.username,
        newUser.email,
        confirmLink,
        "first_email_confirmation",
      );

      return {
        message: `User created, we sent a message to your email, please confirm!`,
      };
    } catch (error) {
      if (error instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(
          "We couldn't process your request.",
        );
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Unexpected error",
      );
    }
  }

  async confirmEmail(token: string) {
    try {
      const payload: TokenPayload = this.tokenService.verifyToken(
        token,
        this.customConfigService.getJwtConfirmEmailSecret(),
      );

      await this.userService.markEmailAsVerified(payload.sub);

      return { message: "Email successfully confirmed" };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token invalid or expired!");
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Unexpected error",
      );
    }
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({ email }, true);

      const isValid =
        user && (await this.hashService.compare(password, user.password));

      if (!isValid) {
        throw new UnauthorizedException("Invalid credentials.");
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException("Invalid credentials.");
      } else {
        throw new InternalServerErrorException(
          error instanceof Error ? error.message : "Unexpected error",
        );
      }
    }
  }

  async login(user: User, response: Response) {
    if (!user.emailVerified) {
      const tokenPayload: TokenPayload = {
        sub: user.id,
      };

      const { token } =
        this.tokenService.generateConfirmEmailToken(tokenPayload);

      const confirmLink = `${this.customConfigService.getServerUrl()}/auth/confirm-email?token=${token}`;

      await this.mailerService.sendEmailConfirmation(
        user.username,
        user.email,
        confirmLink,
        "first_email_confirmation",
      );

      throw new UnauthorizedException(
        "Please verify your email before logging in, we sent a message there.",
      );
    }

    const tokenPayload: TokenPayload = {
      sub: user.id,
    };

    const { token, expiresIn } =
      this.tokenService.generateAccessToken(tokenPayload);

    const expires = new Date(Date.now() + ms(expiresIn));

    response.cookie("Authentication", token, {
      secure: true,
      httpOnly: true,
      sameSite:
        this.customConfigService.getNodeEnv() === "development"
          ? "lax"
          : "strict",
      expires,
      path: "/",
    });

    return {
      message: "Login successful.",
    };
  }

  async forgotPassword(emailDto: EmailDto) {
    const email = emailDto.value;
    const user = await this.userService.getUser({ email });

    if (user) {
      const tokenPayload: TokenPayload = {
        sub: user.id,
      };

      const { token } =
        this.tokenService.generateResetPasswordToken(tokenPayload);

      const resetLink = `${this.customConfigService.getServerUrl()}/auth/reset-password?token=${token}`;

      await this.mailerService.sendPasswordReset(
        user.username,
        email,
        resetLink,
      );
    }

    return {
      message: `If an account with the email ${email} exists, a message has been sent with password reset instructions.`,
    };
  }

  async resetPassword(token: string, passwordDto: PasswordDto) {
    const payload: TokenPayload = this.tokenService.verifyToken(
      token,
      this.customConfigService.getJwtResetPasswordSecret(),
    );

    const hasedPassword = await this.hashService.hash(passwordDto.value);

    await this.userService.changePassword(payload.sub, hasedPassword);

    return {
      message: "Password changed successfully",
    };
  }

  async changeUsername(
    userId: TokenPayload,
    changeUsernameDto: ChangeUsernameDto,
  ) {
    try {
      const user = await this.userService.getUser({ id: userId.sub }, true);

      const isValid =
        user &&
        (await this.hashService.compare(
          changeUsernameDto.password,
          user.password,
        ));

      if (!isValid || user.id != userId.sub) {
        throw new UnauthorizedException("You are not authorized!");
      }

      await this.userService.changeUsername(
        userId.sub,
        changeUsernameDto.username,
      );

      return { message: "Username successfully changed!" };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token invalid or expired!");
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Unexpected error",
      );
    }
  }

  async changeEmailRequest(
    userId: TokenPayload,
    changeEmailDto: ChangeEmailDto,
  ) {
    const user = await this.userService.getUser({ id: userId.sub }, true);

    const isValid =
      user &&
      (await this.hashService.compare(changeEmailDto.password, user.password));

    if (!isValid) {
      throw new UnauthorizedException("You are not authorized!");
    }

    if (user.email === changeEmailDto.newEmail) {
      throw new UnprocessableEntityException(
        "The new email must be different from your current one.",
      );
    }

    const isEmailAlreadyInUse = await this.userService.getUser({
      email: changeEmailDto.newEmail,
    });

    if (isEmailAlreadyInUse) {
      throw new UnprocessableEntityException(
        "Could not update your information.",
      );
    }

    const tokenPayload: TokenPayload = {
      sub: userId.sub,
      email: changeEmailDto.newEmail,
    };

    const { token } = this.tokenService.generateConfirmEmailToken(tokenPayload);

    const confirmLink = `${this.customConfigService.getServerUrl()}/auth/change-email-confirm?token=${token}`;

    await this.mailerService.sendEmailConfirmation(
      user.username,
      changeEmailDto.newEmail,
      confirmLink,
      "confirm_email_change",
    );

    return {
      message: `We sent a message to your new email: ${changeEmailDto.newEmail}, please confirm!`,
    };
  }

  async changeEmailConfirm(userId: TokenPayload, token: string) {
    try {
      const payload: TokenPayload = this.tokenService.verifyToken(
        token,
        this.customConfigService.getJwtConfirmEmailSecret(),
      );

      if (payload.sub != userId.sub) {
        throw new UnauthorizedException("You are not authorized!");
      }

      if (!payload.email) {
        throw new BadRequestException("Missing email property.");
      }

      await this.userService.changeEmail(payload.sub, payload.email);

      return { message: "Email successfully changed!" };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token invalid or expired!");
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Unexpected error",
      );
    }
  }

  async changePassword(
    userId: TokenPayload,
    changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const user = await this.userService.getUser({ id: userId.sub }, true);

      const isValid =
        user &&
        (await this.hashService.compare(
          changePasswordDto.currentPassword,
          user.password,
        ));

      if (!isValid || user.id != userId.sub) {
        throw new UnauthorizedException("You are not authorized!");
      }

      const hasedPassword = await this.hashService.hash(
        changePasswordDto.newPassword,
      );

      await this.userService.changePassword(userId.sub, hasedPassword);

      return { message: "Password successfully changed!" };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token invalid or expired!");
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Unexpected error",
      );
    }
  }

  async changeProfileImage(
    userId: TokenPayload,
    changeProfileImageDto: ChangeProfileImageDto,
    file?: Express.Multer.File,
  ) {
    try {
      const user = await this.userService.getUser({ id: userId.sub }, true);

      const isValid =
        user &&
        (await this.hashService.compare(
          changeProfileImageDto.password,
          user.password,
        ));

      if (!isValid || user.id != userId.sub) {
        throw new UnauthorizedException("You are not authorized!");
      }

      if (changeProfileImageDto.action === ActionType.DELETE) {
        if (!user.profileImage) {
          throw new BadRequestException("No profile image to delete");
        }

        const response = await this.cloudinaryService.delete(user.profileImage);

        if (response.success === false) {
          throw new BadRequestException(response.error);
        }

        await this.userService.changeProfileImage(userId.sub, "delete");

        return { message: "Profile image updated successfully" };
      }

      if (!file) {
        throw new BadRequestException("No file provided for upload");
      }

      const response = await this.cloudinaryService.upload(
        [file],
        `${this.customConfigService.getCloudinaryFolder()}/profile_images`,
      );

      if (response.success === false) {
        throw new BadRequestException(response.error);
      }

      await this.userService.changeProfileImage(
        userId.sub,
        "update",
        response.data[0].secure_url,
      );

      return { message: "Profile image updated successfully" };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token invalid or expired!");
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Unexpected error",
      );
    }
  }
}
