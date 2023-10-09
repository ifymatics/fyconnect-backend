import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostsRepository) {}
  create(createPostDto: CreatePostDto, userId: string) {
    return this.postRepository.create({
      ...createPostDto,
      timestamp: new Date(),
      userId,
    });
  }

  findAll() {
    return this.postRepository.find({});
  }

  findOne(id: string) {
    return this.postRepository.findOne({ _id: id });
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return this.postRepository.findOneAndUpdate(
      { _id: id },
      { $set: updatePostDto },
    );
  }

  remove(id: string) {
    return this.postRepository.findOneAndDelete({ _id: id });
  }
}
