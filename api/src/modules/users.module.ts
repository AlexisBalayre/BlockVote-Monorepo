import { Module } from '@nestjs/common';
import { UsersService } from '@src/services';
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "@src/models";
import { ConfigModule } from '@nestjs/config';
import { UsersController } from '@src/controllers';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: 'user', schema: UserSchema }])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }