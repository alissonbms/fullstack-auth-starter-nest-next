import { User } from "@/interfaces/user-interface";
import { cookies } from "next/headers";
import { api } from "./api";

const getServerAuthUser = async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("Authentication");

  if (!cookie) return null;

  try {
    const res = await api.get("/auth/session", {
      headers: {
        Cookie: `${cookie.name}=${cookie.value}`,
      },
    });

    return res.data;
  } catch {
    return null;
  }
};

export default getServerAuthUser;
