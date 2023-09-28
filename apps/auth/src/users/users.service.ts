import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UserRepository) {}
  async create(userCreateDto: CreateUserDto) {
    return this.usersRepository.create(userCreateDto);
  }
}
