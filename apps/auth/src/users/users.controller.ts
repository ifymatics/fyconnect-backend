import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
// import { currentUser } from '../current-user.decorator';
import { UsersDocument } from './schemas/user.schema';
import { JwtAuthGuard } from '../guards';
import { currentUser } from '@app/common';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@currentUser() user: UsersDocument) {
    return user;
  }
}
