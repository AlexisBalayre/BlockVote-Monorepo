import { IsString, IsEthereumAddress, IsEmail } from 'class-validator';

export class AuthPostLoginDto {
  @IsString()
  public email: string;

  @IsString()
  public password: string;
}
