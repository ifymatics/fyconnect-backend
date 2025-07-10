import { Injectable, NotFoundException, ConflictException, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { LikeRepository } from './repositories/like.repository';
import { LikeEntity, LikeableEntityType } from './entities/like.entity';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { POST_SERVICE, COMMENT_SERVICE } from './constants/services'; // Import defined constants

// DTOs
export class CreateLikeDto {
  entityId: number;
  entityType: LikeableEntityType;
}

@Injectable()
export class LikeServiceService {
  constructor(
    private readonly likeRepository: LikeRepository,
    @Inject(POST_SERVICE) private readonly postServiceClient: ClientProxy,
    @Inject(COMMENT_SERVICE) private readonly commentServiceClient: ClientProxy,
  ) {}

  private async validateEntityExists(entityId: number, entityType: LikeableEntityType): Promise<void> {
    try {
      let response = null;
      if (entityType === LikeableEntityType.POST) {
        response = await firstValueFrom(
          this.postServiceClient.send({ cmd: 'get_post_by_id' }, { id: entityId }).pipe(timeout(5000))
        );
      } else if (entityType === LikeableEntityType.COMMENT) {
        response = await firstValueFrom(
          this.commentServiceClient.send({ cmd: 'get_comment_by_id' }, { id: entityId }).pipe(timeout(5000))
        );
      } else {
        throw new HttpException('Invalid entity type for like.', HttpStatus.BAD_REQUEST);
      }

      if (!response) { // If service returns null/undefined for a non-existent entity
        throw new NotFoundException(`${entityType} with ID ${entityId} not found.`);
      }
    } catch (error) {
      console.error(`Error validating ${entityType} ${entityId}:`, error);
      if (error instanceof HttpException) throw error; // Re-throw if already HttpException (e.g. NotFoundException)
      // Handle cases like timeout or service being down
      throw new HttpException(`Failed to validate ${entityType} or service unavailable.`, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async addLike(createLikeDto: CreateLikeDto, userId: string): Promise<LikeEntity> {
    const { entityId, entityType } = createLikeDto;

    await this.validateEntityExists(entityId, entityType);

    const existingLike = await this.likeRepository.findOneByCriteria({
      userId,
      entityId,
      entityType,
    });

    if (existingLike) {
      throw new ConflictException('User has already liked this entity.');
    }

    const likeData: Partial<LikeEntity> = {
      userId,
      entityId,
      entityType,
    };
    return this.likeRepository.create(likeData);
  }

  async removeLike(entityId: number, entityType: LikeableEntityType, userId: string): Promise<void> {
    const like = await this.likeRepository.findOneByCriteria({
      userId,
      entityId,
      entityType,
    });

    if (!like) {
      throw new NotFoundException('Like not found for this entity by the user.');
    }
    await this.likeRepository.remove(like.id);
  }

  async getLikesForEntity(entityId: number, entityType: LikeableEntityType): Promise<{ likes: LikeEntity[], count: number }> {
    const likes = await this.likeRepository.findByEntity(entityId, entityType);
    const count = await this.likeRepository.countByEntity(entityId, entityType);
    return { likes, count };
  }

  async getLikesByUserId(userId: string): Promise<LikeEntity[]> {
    return this.likeRepository.findByUserId(userId);
  }

  async hasUserLikedEntity(userId: string, entityId: number, entityType: LikeableEntityType): Promise<boolean> {
    const like = await this.likeRepository.findOneByCriteria({ userId, entityId, entityType });
    return !!like;
  }
}
