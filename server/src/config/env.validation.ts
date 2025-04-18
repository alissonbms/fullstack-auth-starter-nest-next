import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
  ValidationError,
} from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
  Provision = "provision",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number = 3001;

  @IsUrl({ protocols: ["postgresql"], require_tld: false })
  DATABASE_URL: string;

  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  MAIL_PORT: number;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASS: string;
}

function formatErrors(errors: ValidationError[]): string {
  return errors
    .map((err) => {
      const constraints = err.constraints
        ? Object.values(err.constraints).join(", ")
        : "Unknown error";
      return `- ${err.property}: ${constraints}`;
    })
    .join("\n");
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `❌ Environment validation failed:\n${formatErrors(errors)}`,
    );
  }

  return validatedConfig;
}
