import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { GetUserDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(userCreateDto: CreateUserDto) {
    await this.validateCreateUserDto(userCreateDto);
    return this.usersRepository.create({
      ...userCreateDto,
      password: await bcrypt.hash(userCreateDto.password, 10),
    });
  }
  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    try {
      await this.usersRepository.findOne({ email: createUserDto.email });
    } catch (error) {
      return;
    }
    throw new UnprocessableEntityException('Email is already in use.');
  }
  async verifyUser(username: string, password: string) {
    const user = await this.usersRepository.findOne({ email: username });
    const passwordIsValid = await bcrypt.compare(password, user?.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return user;
  }
  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOne(getUserDto);
  }
}
