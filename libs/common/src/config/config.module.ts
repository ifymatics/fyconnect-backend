import { Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import * as joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: joi.object({ MONGODB_URI: joi.string().required() }),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
