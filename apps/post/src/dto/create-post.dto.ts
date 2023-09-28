import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsNumber()
  image: string;
}
