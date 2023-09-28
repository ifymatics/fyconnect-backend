import { IsNotEmpty, IsEmail, IsStrongPassword } from 'class-validator';
export class CreateUserDto {
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
