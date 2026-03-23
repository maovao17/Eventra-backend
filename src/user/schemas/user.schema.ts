// This is a schema, it is defining the Users attribites For example take it as blueprint of user, this is how it will be store in the database
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as validator from 'validator';

export type UserDocument = User & Document;

@Schema({ timestamps: true})
export class User {
    @Prop({
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: (value: string) => /^(\+91)?[6-9]\d{9}$/.test(value),
            message: 'Invalid phone number',
        },
    })
    phoneNumber: string;

    @Prop({
        required: true, 
        trim: true
    })
    name: string;

    @Prop({
        required: false,
        trim: true,
        validate: {
            validator: (value: string) => !value || validator.isURL(value, { require_protocol: true}),
            message: 'Invalid format',
        },
    })
    profile_photo?: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, enum: ['customer', 'vendor'] })
    role: string;

    @Prop({ required: false, trim: true })
    businessName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
    versionKey: false,
});
