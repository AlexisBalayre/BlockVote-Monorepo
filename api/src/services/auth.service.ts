import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { AccessRole, GarageRole } from '@src/enums';
import { LoginRegisterResponse, User } from '@src/interfaces/auth.interface';
import * as argon2 from 'argon2';
import { AuthPostLoginDto, AuthPostRegisterDto } from '@src/dtos';
import { UserDocument } from '@src/models';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Hashes password
  private async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await argon2.hash(password);
      return hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Error hashing password');
    }
  }

  // Verifies password
  private async verifyPassword(
    hashedPassword: string,
    password: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, password);
    } catch (error) {
      throw new Error('Error verifying password');
    }
  }

  // Logs in user
  async login(
    dto: AuthPostLoginDto,
  ): Promise<LoginRegisterResponse> {

    try {
      // Checks if inputs are valid
      if (!(dto.email && dto.password)) {
        this.logger.debug('Invalid inputs');
        throw new Error('Invalid inputs');
      }

      // Gets user from database
      const user = (await this.usersService.getUser({ email: dto.email })).user;
      
      // Checks if user exists
      if (!user) {
        this.logger.debug('User does not exist');
        throw new Error('User does not exist');
      }

      if (!(await this.verifyPassword(user.password, dto.password))) {
        this.logger.debug('Password is incorrect');
        throw new Error('Password is incorrect');
      }

      return {
        user: user,
        access_token: this.jwtService.sign(user),
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new Error(error.message);
    }
  }

  // Registers user
  async register(
    dto: AuthPostRegisterDto,
  ): Promise<LoginRegisterResponse> {
    try {
      // Checks if email is valid
      if (!dto.email) {
        this.logger.debug('Email is required');
        throw new Error('Email is required');
      } 

      if(!dto.password) {
        this.logger.debug('Password is required');
        throw new Error('Password is required')
      };

      // Checks if user already exists
      const user = await this.usersService.getUser({ email: dto.email });
      if (user.user) {
        this.logger.debug('User already exists');
        throw new Error('User already exists');
      }

      // Creates user
      const passwordHashed = await this.hashPassword(dto.password);
      const newUser = (await this.usersService.createUser(dto.email, passwordHashed, dto.lab, dto.accessRole, dto.garageRole, true)).user;
      
      // Checks if user was created
      if (!newUser) {
        this.logger.debug('User could not be created');
        throw new Error('User could not be created');
      }

      return {
        user: newUser,
        access_token: this.jwtService.sign(newUser),
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new Error(error.message);
    }
  }

  // Checks if user is admin
  async isAdmin(user: User): Promise<boolean> {
    // Checks if user exists and is admin
    return user?.accessRole === AccessRole.Admin;
  }

  // Checks if user is admin
  async isSuperAdmin(user: User): Promise<boolean> {
    // Checks if user exists and is admin
    return user?.accessRole === AccessRole.SuperAdmin;
  }
}
