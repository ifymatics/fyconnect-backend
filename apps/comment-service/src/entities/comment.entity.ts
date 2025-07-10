import { AbstractTypeOrmEntity } from '@app/common';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'comments' })
export class CommentEntity extends AbstractTypeOrmEntity {
  @Column()
  @Index() // Index for faster queries by userId
  userId: string; // ID of the user who made the comment

  @Column()
  @Index() // Index for faster queries by postId
  postId: number; // ID of the post this comment belongs to (assuming PostEntity.id is number)

  @Column({ type: 'text' })
  content: string;

  // If comments can be nested, you might add:
  // @Column({ type: 'integer', nullable: true })
  // @Index()
  // parentCommentId?: number;

  // @ManyToOne(() => CommentEntity, { nullable: true, onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'parentCommentId' })
  // parentComment?: CommentEntity;

  // @OneToMany(() => CommentEntity, comment => comment.parentComment)
  // replies?: CommentEntity[];
}
