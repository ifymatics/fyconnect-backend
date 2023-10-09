/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { PostsDocument } from './schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsRepository extends AbstractRepository<PostsDocument> {
  protected readonly logger = new Logger(PostsRepository.name);

  constructor(
    @InjectModel(PostsRepository.name) postModel: Model<PostsDocument>,
  ) {
    super(postModel);
  }
}
