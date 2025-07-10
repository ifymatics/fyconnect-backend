import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { LikeEntity, LikeableEntityType } from '../entities/like.entity';

@Injectable()
export class LikeRepository {
  protected readonly logger = new Logger(LikeRepository.name);

  constructor(
    @InjectRepository(LikeEntity)
    private readonly likeModel: Repository<LikeEntity>,
  ) {}

  async create(createLikeDto: Partial<LikeEntity>): Promise<LikeEntity> {
    const newLike = this.likeModel.create(createLikeDto);
    return this.likeModel.save(newLike);
  }

  async findOneByCriteria(criteria: FindOptionsWhere<LikeEntity>): Promise<LikeEntity | null> {
    return this.likeModel.findOneBy(criteria);
  }

  async findByUserId(userId: string): Promise<LikeEntity[]> {
    return this.likeModel.find({ where: { userId } });
  }

  async findByEntity(entityId: number, entityType: LikeableEntityType): Promise<LikeEntity[]> {
    return this.likeModel.find({ where: { entityId, entityType } });
  }

  async countByEntity(entityId: number, entityType: LikeableEntityType): Promise<number> {
    return this.likeModel.count({ where: { entityId, entityType } });
  }

  async remove(id: number): Promise<void> {
    await this.likeModel.delete(id);
  }

  async removeByCriteria(criteria: FindOptionsWhere<LikeEntity>): Promise<void> {
    await this.likeModel.delete(criteria);
  }
}
