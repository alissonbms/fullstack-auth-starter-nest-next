import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CustomConfigService } from "src/config/custom-config.service";
import { TokenPayload } from "./interfaces/token-payload.interface";
import * as ms from "ms";

type TokenWithExpiration = {
  token: string;
  expiresIn: ms.StringValue;
};
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly customConfigService: CustomConfigService,
  ) {}

  generateToken(
    payload: TokenPayload,
    secret: string,
    expiresIn: string,
  ): TokenWithExpiration {
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn: expiresIn as ms.StringValue };
  }

  verifyToken(token: string, secret: string): { sub: string } {
    return this.jwtService.verify(token, { secret });
  }

  generateAccessToken(payload: TokenPayload): TokenWithExpiration {
    const secret = this.customConfigService.getJwtAccessSecret();
    const expiresIn = this.customConfigService.getJwtAccessExpiration();
    return this.generateToken(payload, secret, expiresIn);
  }

  generateConfirmEmailToken(payload: TokenPayload): TokenWithExpiration {
    const secret = this.customConfigService.getJwtConfirmEmailSecret();
    const expiresIn = this.customConfigService.getJwtConfirmEmailExpiration();
    return this.generateToken(payload, secret, expiresIn);
  }

  generateResetPasswordToken(payload: TokenPayload): TokenWithExpiration {
    const secret = this.customConfigService.getJwtResetPasswordSecret();
    const expiresIn = this.customConfigService.getJwtResetPasswordExpiration();
    return this.generateToken(payload, secret, expiresIn);
  }
}
