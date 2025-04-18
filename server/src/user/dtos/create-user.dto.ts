import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Username must not be empty." })
  @MinLength(3, { message: "Username must be at least 3 characters." })
  @MaxLength(20, {
    message: "Username must be a maximum of 20 characters long.",
  })
  username: string;

  @IsNotEmpty({ message: "Email must not be empty." })
  @IsEmail({}, { message: "Invalid email format." })
  email: string;

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
  password: string;
}
