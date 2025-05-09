import { IsEnum, IsIn, IsNotEmpty } from "class-validator";

enum ActionType {
  UPDATE = "update",
  DELETE = "delete",
}

export class ChangeProfileImageDto {
  @IsNotEmpty({ message: "Current password must not be empty." })
  password: string;
  @IsIn(["update", "delete"], {
    message: "Action must be either 'update' or 'delete'",
  })
  @IsEnum(ActionType)
  action: ActionType;
}
