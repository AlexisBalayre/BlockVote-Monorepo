import { User as UserModel } from '@src/models';

export interface User {
    email: string;
    garageRole: string;
    accessRole: string;
    isStillMember: boolean;
}

export interface LoginRegisterResponse {
    access_token: string;
    user: User;
}