/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller, Get, Post, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard, JwtAuthGuard } from './guards';
import { currentUser } from './current-user.decorator';
import { UsersDocument } from './users/schemas/user.schema';
import { Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';
// import { JwtAuthGuard } from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @currentUser() user: UsersDocument,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    response.send(user);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.user;
  }
}
