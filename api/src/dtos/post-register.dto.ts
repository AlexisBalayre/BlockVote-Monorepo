import { IsString, IsEthereumAddress, IsEmail, IsNotEmpty} from 'class-validator';
import { GarageRole, AccessRole, Lab } from '@src/enums';

export class AuthPostRegisterDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public password: string;

  @IsNotEmpty()
  @IsString()
  public lab: Lab;

  @IsString()
  accessRole: AccessRole;

  @IsNotEmpty()
  @IsString()
  garageRole: GarageRole;
}
