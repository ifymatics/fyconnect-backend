import { AbstractTypeOrmEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'posts' })
export class PostEntity extends AbstractTypeOrmEntity {
  @Column({ type: 'text' })
  content: string; // Renamed from 'desc' for clarity

  @Column() // Assuming userId will be a string, e.g., from auth service (could be UUID)
  userId: string;

  @Column({ type: 'varchar', length: 2048, nullable: true }) // URL for an image
  imageUrl?: string; // Renamed from 'image' for clarity and made optional
}
