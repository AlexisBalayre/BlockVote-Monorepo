import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as generator from 'generate-password';
import * as argon2 from 'argon2';

import { User, UserDocument } from '@src/models';
import { AccessRole, GarageRole, Lab } from '@src/enums';
import { UserCreated, GetUser, GetUsers, ResponseBddUpdate, ImageClaimed } from '@src/interfaces';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('user') 
        private readonly userModel: Model<UserDocument>
    ) {}
    // Creates a new user
    async createUser(
        email: string, 
        password: string = "",
        lab: Lab,
        accessRole: AccessRole = AccessRole.User,
        garageRole: GarageRole = GarageRole.LabMember,
        isStillMember: boolean = true,

    ): Promise<UserCreated> {
        try {
            const user = await this.userModel.create({
                email: email,
                password: password,
                lab: lab,
                accessRole: accessRole,
                garageRole: garageRole,
                isStillMember: isStillMember,
                creationDate: Date.now(),
                lastConnection: Date.now(),
            });
            return {user: user};
        } catch (error) {
            throw new Error('Error creating user');
        }
    }

    private generateRandomPassword(): string {
        return generator.generate({
            length: 20,
            numbers: true,
            symbols: true,
            uppercase: true,
            lowercase: true,
        });
    }

    // Returns an user
    async getUser(query: object ): Promise<GetUser> {
        try {
            const user = await this.userModel.findOne(query);
            if (!user) {
                throw new Error('User not found');
            }
            return {user: user};
        } catch (error) {
            throw new Error('Error getting user');
        }
    }

    // Returns all users with a filter
    async getUsers(query: object ): Promise<GetUsers> {
        const users = await this.userModel.find(query);
        if (!users) {
            throw new Error('No users found');
        }
        return {users: users};
    }

    // Updates an user
    private async updateUser(query: object, update: object): Promise<ResponseBddUpdate> {
        try {
            const user = await this.userModel.findOneAndUpdate(query, update, { new: true });
            if (!user) {
                throw new Error('User not found');
            }
            return {success: true};
        } catch (error) {
            throw new Error('Error updating user');
        }
    }

    // Updates an user's lab
    async updateUserLab(email: string, lab: Lab): Promise<ResponseBddUpdate> {
        try {
            const user = await this.updateUser({email: email}, {lab: lab});
            if (!user) {
                throw new Error('User not found');
            }
            return {success: true};
        } catch (error) {
            throw new Error('Error updating user lab');
        }
    }

    // Updates an user's role
    async updateUserAccessRole(email: string, accessRole: AccessRole): Promise<ResponseBddUpdate> {
        try {
            const user = await this.updateUser({email: email}, {accessRole: accessRole});
            if (!user) {
                throw new Error('User not found');
            }
            return {success: true};
        } catch (error) {
            throw new Error('Error updating user role');
        }
    }

    // Updates an user's garage role
    async updateUserGarageRole(email: string, garageRole: GarageRole): Promise<ResponseBddUpdate> {
        try {
            const user = await this.updateUser({email: email}, {garageRole: garageRole});
            if (!user) {
                throw new Error('User not found');
            }
            return {success: true};
        } catch (error) {
            throw new Error('Error updating user garage role');
        }
    }

    // Updates an user's last connection
    async updateUserLastConnection(email: string): Promise<ResponseBddUpdate> {
        try {
            await this.updateUser({email: email}, {lastConnection: Date.now()});
            return {success: true};
        } catch (error) {
            throw new Error('Error updating user last connection');
        }
    }

    // Deletes an user 
    async deleteUser(email: string): Promise<ResponseBddUpdate> {
        try {
            const user = await this.userModel.findOneAndDelete({email: email});
            if (!user) {
                throw new Error('User not found');
            }
            return {success: true};
        } catch (error) {
            throw new Error('Error deleting user');
        }
    }

    // Updates the password of an user
    private async updateUserPassword(email: string, password: string): Promise<ResponseBddUpdate> {
        try {
            await this.updateUser({email: email}, {password: password});
            return {success: true};
        } catch (error) {
            throw new Error('Error updating user password');
        }
    }

    // Changes the password of an user
    async changeUserPassword(email: string, oldPassword: string, newPassword: string): Promise<ResponseBddUpdate> {
        try {
            const user = await this.getUser({email: email});
            if (!user.user) {
                throw new Error('User not found');
            }
            if (user.user.password !== oldPassword) {
                throw new Error('Wrong password');
            }
            await this.updateUserPassword(email, newPassword);
            return {success: true};
        } catch (error) {
            throw new Error('Error changing user password');
        }
    }

    // Generates a new password for an user
    async generateNewPassword(email: string): Promise<ResponseBddUpdate> {
        try {
            const newPassword = this.generateRandomPassword();
            const newPasswordHashed = await argon2.hash(newPassword);
            await this.updateUserPassword(email, newPasswordHashed);
            return {success: true};
        } catch (error) {
            throw new Error('Error generating new user password');
        }
    }

}