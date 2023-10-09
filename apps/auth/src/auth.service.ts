import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { UsersDocument } from './users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token-payload.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async login(user: UsersDocument, res: Response) {
    const tokenPayload: TokenPayload = { userId: user._id.toHexString() };
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );
    const token = this.jwtService.sign(tokenPayload, {
      expiresIn: Number(expires),
    });
    res.cookie('Authentication', token, {
      expires,
      httpOnly: true,
    });
  }
}
