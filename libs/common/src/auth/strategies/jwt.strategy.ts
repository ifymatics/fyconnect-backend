import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface'; // Define this interface in common

@Injectable()
export class CommonJwtStrategy extends PassportStrategy(Strategy, 'jwt') { // Named 'jwt' explicitly
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          // Check cookies, then Authorization header
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['Authentication'];
          }
          if (!token && request && request.headers && request.headers.authorization) {
            // Standard Bearer token extraction
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
              token = authHeader.substring(7);
            } else {
              // Fallback for non-standard 'Authentication' header used in original strategy
              token = request.headers.authorization;
            }
          }
          // Fallback for potential 'Authentication' header as per original strategy
          if (!token && request && request.Authentication) {
             token = request.Authentication;
          }
          return token;
        },
      ]),
      ignoreExpiration: false, // Default is false, ensure tokens are not expired
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    // The goal of this strategy in a common library, especially for a gateway,
    // is to validate the token and attach its payload to the request.
    // It should not depend on specific application services like UsersService.
    // Services that need the full user object can fetch it using the userId from this payload.
    return payload; // Contains userId, email, etc.
  }
}
