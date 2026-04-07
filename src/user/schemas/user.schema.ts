// This is a schema, it is defining the Users attribites For example take it as blueprint of user, this is how it will be store in the database
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as validator from 'validator';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: (value: string) => !value || /^(\+91)?[6-9]\d{9}$/.test(value),
      message: 'Invalid phone number',
    },
  })
  phoneNumber?: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  })
  email?: string;

  @Prop({
    required: false,
    trim: true,
    validate: {
      validator: (value: string) =>
        !value || validator.isURL(value, { require_protocol: true }),
      message: 'Invalid format',
    },
  })
  profile_photo?: string;

  @Prop({ required: true, unique: true, trim: true })
  userId: string;

  @Prop({ required: true, enum: ['phone', 'google'], default: 'phone' })
  authProvider: 'phone' | 'google';

  @Prop({ required: true, enum: ['customer', 'vendor', 'admin'] })
  role: string;

  @Prop({ required: false, trim: true })
  businessName?: string;

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'approved' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  versionKey: false,
});
