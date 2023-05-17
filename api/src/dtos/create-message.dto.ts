import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageInput {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  nonce: string;
}
