import { AbstractRepository } from '@app/common';
import { UsersDocument, UsersSchema } from './schemas/user.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

// eslint-disable-next-line prettier/prettier
@Injectable()
export class UserRepository extends AbstractRepository<UsersDocument> {
  protected readonly logger = new Logger(UserRepository.name);
  constructor(
    @InjectModel(UsersDocument.name) userModel: Model<UsersDocument>,
  ) {
    super(userModel);
  }
}
