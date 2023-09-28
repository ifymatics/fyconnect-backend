import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { DatabaseModule } from '@app/common';
import { PostsRepository } from './posts.repository';
import { PostsSchema } from './schemas/post.schema';
import { LoggerModule } from '@app/common';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: PostsRepository.name, schema: PostsSchema },
    ]),
    LoggerModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
})
export class PostsModule {}
