import { IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class ChangeUsernameDto {
  @IsNotEmpty({ message: "Username must not be empty." })
  @MinLength(3, { message: "Username must be at least 3 characters." })
  @MaxLength(20, {
    message: "Username must be a maximum of 20 characters long.",
  })
  username: string;
  @IsNotEmpty({ message: "Current password must not be empty." })
  password: string;
}
