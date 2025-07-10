import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { DynamicDatabaseModule, AUTH_SERVICE, LoggerModule, AbstractTypeOrmEntity } from '@app/common'; // Updated DatabaseModule
import { PostRepository } from './repositories/post.repository'; // Corrected path
// import { PostsSchema } from './schemas/post.schema'; // Will be removed
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'; // For forFeature and options type
import { PostEntity } from './entities/post.entity'; // Import PostEntity
import { ClientsModule, Transport } from '@nestjs/microservices';
// import { AUTH_SERVICE } from '@app/common/auth/constants/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule global if not already elsewhere
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_TYPE: Joi.string().default('postgres'),
        AUTH_HOST: Joi.string().required(), // Keep existing non-DB vars
        AUTH_PORT: Joi.number().required(),
        TCP_PORT: Joi.number().required(), // Assuming TCP_PORT is also used by this service
      }),
      envFilePath: './apps/post/.env',
    }),
    DynamicDatabaseModule.forRootAsync({
      dbType: 'typeorm',
      typeOrmConfig: {
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          type: configService.getOrThrow<string>('DB_TYPE') as any,
          host: configService.getOrThrow<string>('DB_HOST'),
          port: configService.getOrThrow<number>('DB_PORT'),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          database: configService.getOrThrow<string>('DB_NAME'),
          entities: [PostEntity], // Add PostEntity here
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') !== 'production' ? 'all' : ['error'],
        } as TypeOrmModuleOptions),
      },
    }),
    TypeOrmModule.forFeature([PostEntity]), // Add this for repository injection
    LoggerModule,
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow('AUTH_HOST'),
            port: configService.getOrThrow('AUTH_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostRepository], // Updated to new PostRepository
})
export class PostsModule {}
