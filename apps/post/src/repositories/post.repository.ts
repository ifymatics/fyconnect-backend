import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class PostRepository {
  protected readonly logger = new Logger(PostRepository.name);

  constructor(
    @InjectRepository(PostEntity)
    private readonly postModel: Repository<PostEntity>,
    private readonly entityManager: EntityManager, // Optional: for more complex queries or transactions
  ) {}

  async create(createPostDto: Partial<PostEntity>): Promise<PostEntity> {
    const newPost = this.postModel.create(createPostDto);
    return this.postModel.save(newPost);
  }

  async findAll(): Promise<PostEntity[]> {
    return this.postModel.find();
  }

  async findOne(id: number): Promise<PostEntity | null> {
    return this.postModel.findOneBy({ id });
  }

  async update(id: number, updatePostDto: Partial<PostEntity>): Promise<PostEntity | null> {
    // TypeORM's update method doesn't return the entity directly in all cases.
    // Fetch it after update or use save method for returning the updated entity.
    const updateResult = await this.postModel.update(id, updatePostDto);
    if (updateResult.affected === 0) {
      return null; // Or throw NotFoundException
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.postModel.delete(id);
    if (deleteResult.affected === 0) {
      // Or throw NotFoundException if the post to be deleted doesn't exist
      this.logger.warn(`Post with id ${id} not found for deletion.`);
    }
  }

  // Example: Find posts by userId
  async findByUserId(userId: string): Promise<PostEntity[]> {
    return this.postModel.find({ where: { userId } });
  }
}
