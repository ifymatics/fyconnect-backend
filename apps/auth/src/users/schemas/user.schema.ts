import { AbstractDocument } from '@app/common/database';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class UsersDocument extends AbstractDocument {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const UsersSchema = SchemaFactory.createForClass(UsersDocument);
