import { Prisma } from "generated/prisma";

export interface TokenPayload {
  sub: Prisma.UserGetPayload<{
    select: {
      id: true;
    };
  }>["id"];
  email?: string;
  iat?: number;
  exp?: number;
}
