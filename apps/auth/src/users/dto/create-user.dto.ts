import {
  IsEmail,
  IsStrongPassword,
  IsDateString,
  IsString,
  IsObject,
} from 'class-validator';
type Dob = {
  birth_day: number;
  birth_month: number;
  birth_year: number;
};

export class CreateUserDto {
  @IsStrongPassword()
  password: string;
  @IsEmail()
  email: string;
  @IsString()
  gender: string;
  @IsObject()
  dob: Dob;
}
