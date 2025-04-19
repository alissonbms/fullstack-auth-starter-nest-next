import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CustomConfigService } from "src/config/custom-config.service";
import { TokenPayload } from "./interfaces/token-payload.interface";

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
  ): { token: string; expiresIn: string } {
    const token = this.jwtService.sign(payload, { secret, expiresIn });
    return { token, expiresIn };
  }

  verifyToken(token: string, secret: string): { sub: string } {
    return this.jwtService.verify(token, { secret });
  }

  generateAccessToken(payload: TokenPayload): {
    token: string;
    expiresIn: string;
  } {
    const secret = this.customConfigService.getJwtAccessSecret();
    const expiresIn = this.customConfigService.getJwtAccessExpiration();
    return this.generateToken(payload, secret, expiresIn);
  }

  generateConfirmationToken(payload: TokenPayload): {
    token: string;
    expiresIn: string;
  } {
    const secret = this.customConfigService.getJwtConfirmationSecret();
    const expiresIn = "1h";
    return this.generateToken(payload, secret, expiresIn);
  }

  generateChangeEmailToken(payload: TokenPayload): {
    token: string;
    expiresIn: string;
  } {
    const secret = this.customConfigService.getJwtChangeEmailSecret();
    const expiresIn = "1h";
    return this.generateToken(payload, secret, expiresIn);
  }

  generateResetPasswordToken(payload: TokenPayload): {
    token: string;
    expiresIn: string;
  } {
    const secret = this.customConfigService.getJwtResetPasswordSecret();
    const expiresIn = "1h";
    return this.generateToken(payload, secret, expiresIn);
  }
}
