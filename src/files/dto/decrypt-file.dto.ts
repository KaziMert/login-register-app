import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DecryptFileDto {
  @ApiProperty({ example: '-----BEGIN PRIVATE KEY-----\n...' })
  @IsNotEmpty()
  privateKey: string;
}