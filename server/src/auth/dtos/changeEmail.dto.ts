import { IsEmail, IsNotEmpty } from "class-validator";

export class ChangeEmailDto {
  @IsNotEmpty({ message: "New email must not be empty." })
  @IsEmail({}, { message: "Invalid email format." })
  newEmail: string;

  @IsNotEmpty({ message: "Current password must not be empty." })
  password: string;
}
