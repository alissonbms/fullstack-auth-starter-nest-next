import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("confirm-email")
  async confirmEmail(@Body() body: { token: string }) {
    return await this.authService.confirmEmail(body.token);
  }
}
