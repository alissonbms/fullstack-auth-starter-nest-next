import { createParamDecorator, UnauthorizedException } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";
import { User } from "generated/prisma";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: User;
}

const getCurrentUserByContext = (context: ExecutionContext): User => {
  const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;

  if (!user) {
    throw new UnauthorizedException("You are not authorized!");
  }

  return user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
