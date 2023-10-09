import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  desc: string;

  @IsString()
  @IsOptional()
  image: string;
}
