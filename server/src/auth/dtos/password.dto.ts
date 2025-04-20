import { IsNotEmpty, IsStrongPassword } from "class-validator";

export class PasswordDto {
  @IsNotEmpty({ message: "Password must not be empty." })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Password must be at least 8 characters long, including numbers, upper and lower case letters, and symbols.",
    },
  )
  value: string;
}
