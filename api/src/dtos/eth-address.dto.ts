import { IsEthereumAddress } from 'class-validator';

export class ETHAddressDto {
  @IsEthereumAddress()
  public address: string;
}
