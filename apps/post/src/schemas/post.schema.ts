import { AbstractDocument } from '@app/common/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class PostsDocument extends AbstractDocument {
  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  desc: string;

  @Prop({ required: true })
  useId: number;
  @Prop()
  image: string;
}

export const PostsSchema = SchemaFactory.createForClass(PostsDocument);
