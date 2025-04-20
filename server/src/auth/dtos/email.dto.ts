import { IsEmail, IsNotEmpty } from "class-validator";

export class EmailDto {
  @IsNotEmpty({ message: "Email must not be empty." })
  @IsEmail({}, { message: "Invalid email format." })
  value: string;
}
