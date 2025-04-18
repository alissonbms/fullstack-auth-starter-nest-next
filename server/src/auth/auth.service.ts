import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { CustomConfigService } from "src/config/custom-config.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly customConfigService: CustomConfigService,
  ) {}

  async confirmEmail(token: string) {
    try {
      const payload: { sub: string } = this.jwtService.verify(token, {
        secret: this.customConfigService.getJwtConfirmationSecret(),
      });

      await this.prismaService.user.update({
        where: {
          id: payload.sub,
        },
        data: {
          emailVerified: true,
        },
      });

      return { message: "Email successfully confirmed. You can login now." };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException("Token invalid or expired!");
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException("Something went wrong!");
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
