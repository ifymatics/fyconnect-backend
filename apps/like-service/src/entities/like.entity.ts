import { AbstractTypeOrmEntity } from '@app/common';
import { Column, Entity, Index, Unique } from 'typeorm';

export enum LikeableEntityType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  // Add other likeable entity types here, e.g., REEL
}

@Entity({ name: 'likes' })
@Unique(['userId', 'entityId', 'entityType']) // A user can only like an entity once
@Index(['entityId', 'entityType']) // For querying likes of a specific entity
export class LikeEntity extends AbstractTypeOrmEntity {
  @Column()
  @Index()
  userId: string; // ID of the user who liked

  @Column() // This will store the ID of the post or comment.
  entityId: number; // Assuming PostEntity.id and CommentEntity.id are numbers

  @Column({
    type: 'enum',
    enum: LikeableEntityType,
  })
  entityType: LikeableEntityType;
}
