import { User, UserDocument } from "@src/models";

export interface ResponseBddUpdate {
    success: boolean;
}

export interface UserCreated {
    user: {
        email: string;
        password: string;
        lab: string;
        accessRole: string;
        garageRole: string;
        isStillMember: boolean;
        creationDate: Date;
        lastConnection: Date;
    };   
}

export interface GetUser {
    user: UserDocument;
}

export interface GetUsers {
    users: UserDocument[];
}

export interface ImageClaimed {
    images: string[];
}