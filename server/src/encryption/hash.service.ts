import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcryptjs";

Injectable();
export class HashService {
  hash(value: string): Promise<string> {
    return hash(value, 10);
  }
  async compare(value: string, hash: string): Promise<boolean> {
    return await compare(value, hash);
  }
}
