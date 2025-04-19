import { Prisma } from "generated/prisma";

export interface TokenPayload {
  sub: Prisma.UserGetPayload<{
    select: {
      id: true;
    };
  }>["id"];
}
