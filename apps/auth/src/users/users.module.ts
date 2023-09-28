import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule, LoggerModule } from '@app/common';
import { UserRepository } from './users.repository';
import { UsersSchema } from './schemas/user.schema';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: UserRepository.name, schema: UsersSchema },
    ]),
    LoggerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
