import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';

@Injectable()
export class CommentRepository {
  protected readonly logger = new Logger(CommentRepository.name);

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentModel: Repository<CommentEntity>,
  ) {}

  async create(createCommentDto: Partial<CommentEntity>): Promise<CommentEntity> {
    const newComment = this.commentModel.create(createCommentDto);
    return this.commentModel.save(newComment);
  }

  async findAll(): Promise<CommentEntity[]> {
    return this.commentModel.find();
  }

  async findOne(id: number): Promise<CommentEntity | null> {
    return this.commentModel.findOneBy({ id });
  }

  async findByPostId(postId: number): Promise<CommentEntity[]> {
    return this.commentModel.find({ where: { postId }, order: { createdAt: 'ASC' } });
  }

  async findByUserId(userId: string): Promise<CommentEntity[]> {
    return this.commentModel.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async update(id: number, updateCommentDto: Partial<CommentEntity>): Promise<CommentEntity | null> {
    const updateResult = await this.commentModel.update(id, updateCommentDto);
    if (updateResult.affected === 0) {
      return null;
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const deleteResult = await this.commentModel.delete(id);
    if (deleteResult.affected === 0) {
      this.logger.warn(`Comment with id ${id} not found for deletion.`);
    }
  }

  async removeCommentsByPostId(postId: number): Promise<void> {
    await this.commentModel.delete({ postId });
  }
}
