import { Injectable, NotFoundException, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CommentRepository } from './repositories/comment.repository';
import { CommentEntity } from './entities/comment.entity';
import { ClientProxy } from '@nestjs/microservices'; // For potential PostService communication
import { firstValueFrom, timeout } from 'rxjs';
import { POST_SERVICE } from './constants/services'; // Define this constant

// DTOs (can be moved to separate files in a 'dto' folder later)
export class CreateCommentDto {
  postId: number;
  content: string;
}

export class UpdateCommentDto {
  content?: string;
}

@Injectable()
export class CommentServiceService {
  constructor(
    private readonly commentRepository: CommentRepository,
    @Inject(POST_SERVICE) private readonly postServiceClient: ClientProxy,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, userId: string): Promise<CommentEntity> {
    try {
      // It's good practice to ensure the post service is connected before sending a message,
      // or handle connection errors gracefully. For now, we assume it connects on startup.
      // A more specific message pattern like 'validate_post_exists' might be better.
      // For now, using 'get_post_by_id' as PostService likely has this for its own HTTP GET :id.
      // We expect it to throw an error or return null/undefined if not found.
      const post = await firstValueFrom(
        this.postServiceClient.send({ cmd: 'get_post_by_id' }, { id: createCommentDto.postId })
        .pipe(timeout(5000)) // Add a timeout to prevent indefinite hanging
      );
      if (!post) { // Check if post is null or undefined (truthy check)
        throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      // Log the original error for debugging
      console.error("Error validating post:", error);
      if (error instanceof HttpException) throw error; // Re-throw if already an HttpException
      // Handle cases like timeout or post service being down
      throw new HttpException('Failed to validate post or PostService unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const commentData: Partial<CommentEntity> = {
      ...createCommentDto,
      userId,
    };
    return this.commentRepository.create(commentData);
  }

  async getCommentById(id: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne(id);
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async getCommentsByPostId(postId: number): Promise<CommentEntity[]> {
    return this.commentRepository.findByPostId(postId);
  }

  async getCommentsByUserId(userId: string): Promise<CommentEntity[]> {
    return this.commentRepository.findByUserId(userId);
  }

  async updateComment(id: number, updateCommentDto: UpdateCommentDto, userId: string): Promise<CommentEntity> {
    const comment = await this.getCommentById(id);
    if (comment.userId !== userId) {
      throw new HttpException('Forbidden: You can only update your own comments', HttpStatus.FORBIDDEN);
    }
    const updatedComment = await this.commentRepository.update(id, updateCommentDto);
    if (!updatedComment) {
      // This case should ideally be covered by getCommentById or if the update itself fails
      throw new NotFoundException(`Comment with ID ${id} not found or failed to update.`);
    }
    return updatedComment;
  }

  async deleteComment(id: number, userId: string): Promise<void> {
    const comment = await this.getCommentById(id);
    if (comment.userId !== userId) {
      // Add role-based check for admins later if needed
      throw new HttpException('Forbidden: You can only delete your own comments', HttpStatus.FORBIDDEN);
    }
    await this.commentRepository.remove(id);
  }

  async deleteAllCommentsForPost(postId: number): Promise<void> {
    // This might be an internal method called by PostService when a post is deleted.
    // Or exposed to an admin role.
    this.commentRepository.removeCommentsByPostId(postId);
  }
}
