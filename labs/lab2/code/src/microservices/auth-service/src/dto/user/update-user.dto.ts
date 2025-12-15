import { IsOptional, IsString, IsEmail, IsDateString, IsEnum } from "class-validator";
import { Transform, Type } from "class-transformer";
import { Gender } from "./create-user.dto";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  name?: string;

  @IsOptional()
  @IsEmail()
  @Type(() => String)
  email?: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  password_hash?: string;

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
  role_id?: number;
}
