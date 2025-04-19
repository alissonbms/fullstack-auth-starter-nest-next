import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "../interfaces/token-payload.interface";
import { CustomConfigService } from "src/config/custom-config.service";
import { Request } from "express";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly customConfigService: CustomConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.Authentication as string,
      ]),
      secretOrKey: customConfigService.getJwtAccessSecret(),
    });
  }

  validate(payload: TokenPayload): TokenPayload {
    return payload;
  }
}
