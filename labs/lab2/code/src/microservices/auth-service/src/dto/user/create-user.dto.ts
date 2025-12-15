import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, IsNumber } from "class-validator";
import { Transform, Type } from "class-transformer";

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
}

export class CreateUserDto {
  @IsString()
  @Type(() => String)
  name: string;

  @IsEmail()
  @Type(() => String)
  email: string;

  @IsString()
  @Type(() => String)
  password_hash: string;

  @IsOptional()
  @IsDateString()
  @Type(() => String)
  date_of_birth?: Date;

  @IsOptional()
  @IsEnum(Gender)
  @Transform(({ value }) => (value === "" ? undefined : value))
  @Type(() => String)
  gender?: Gender;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  role_id?: number;
}
