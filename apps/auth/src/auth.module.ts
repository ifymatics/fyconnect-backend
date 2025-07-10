import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { LoggerModule } from '@app/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { LocalStrategy } from './strategies'; // JwtStrategy removed from here
import { CommonJwtStrategy, LoggerModule } from '@app/common'; // Import CommonJwtStrategy
import { PassportModule } from '@nestjs/passport'; // Ensure PassportModule is imported

@Module({
  imports: [
    UsersModule,
    LoggerModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Register passport
    ConfigModule.forRoot({ // This should ideally be imported once, perhaps in a shared core module or AppModule if this is the main app module
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        HTTP_PORT: Joi.number().required(),
        TCP_PORT: Joi.number().required(),
      }),
      isGlobal: true, // If true, ConfigModule.forRoot() does not need to be in other modules like UsersModule
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Ensure ConfigModule is available for injection
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.getOrThrow<string>('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, CommonJwtStrategy], // Use CommonJwtStrategy
})
export class AuthModule {}
