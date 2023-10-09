/* eslint-disable prettier/prettier */
import { AbstractRepository } from '@app/common';
import { UsersDocument } from './schemas/user.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository extends AbstractRepository<UsersDocument> {
  protected readonly logger = new Logger(UsersRepository.name);
  constructor(
    @InjectModel(UsersRepository.name) userModel: Model<UsersDocument>,
  ) {
    super(userModel);
  }
}
