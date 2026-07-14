import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DecryptMessagesDto {
  @ApiProperty({ example: 2, description: 'Mesajları çözülecek kullanıcının id\'si' })
  @IsInt()
  userId: number;

  @ApiProperty({ example: '-----BEGIN PRIVATE KEY-----\n...' })
  @IsNotEmpty()
  privateKey: string;
}