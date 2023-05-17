import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { AccessRole, GarageRole, Lab } from '@src/enums';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({unique: true, type: String, required: true})
    email: string;

    @Prop({unique: true, type: String, required: true})
    password: string;

    @Prop({unique: true, type: String, required: true})
    lab: Lab;
    
    @Prop({required: true, type: String})
    accessRole: AccessRole;

    @Prop({required: true, type: String})
    garageRole: GarageRole;

    @Prop({unique: true, type: String, required: true})
    isStillMember: boolean;

    @Prop({unique: false, type: Date, required: true})
    creationDate: Date;

    @Prop({unique: false, type: Date, required: true})
    lastConnection: Date; 
}

export const UserSchema = SchemaFactory.createForClass(User);