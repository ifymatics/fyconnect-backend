import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './repositories/post.repository'; // Updated path
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {} // Updated type

  async create(createPostDto: CreatePostDto, userId: string): Promise<PostEntity> {
    const newPostData: Partial<PostEntity> = {
      content: createPostDto.desc, // Map from DTO
      imageUrl: createPostDto.image, // Map from DTO
      userId,
    };
    return this.postRepository.create(newPostData);
  }

  async findAll(): Promise<PostEntity[]> {
    return this.postRepository.findAll();
  }

  async findOne(id: number): Promise<PostEntity> { // ID is now number
    const post = await this.postRepository.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostEntity> { // ID is now number
    // Map UpdatePostDto fields to PostEntity fields if necessary
    const updateData: Partial<PostEntity> = {};
    if (updatePostDto.desc !== undefined) {
      updateData.content = updatePostDto.desc;
    }
    if (updatePostDto.image !== undefined) {
      updateData.imageUrl = updatePostDto.image;
    }
    // Add other fields from UpdatePostDto if they exist and map to PostEntity

    const updatedPost = await this.postRepository.update(id, updateData);
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found or not updated`);
    }
    return updatedPost;
  }

  async remove(id: number): Promise<void> { // ID is now number
    await this.postRepository.remove(id);
    // The repository method handles not found by logging, or could throw
  }

  async findByUserId(userId: string): Promise<PostEntity[]> {
    return this.postRepository.findByUserId(userId);
  }
}
