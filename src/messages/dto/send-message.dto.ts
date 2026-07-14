import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 2, description: 'Mesajın gideceği kullanıcının id\'si' })
  @IsInt()
  receiverId: number;

  @ApiProperty({ example: 'Merhaba, nasılsın?' })
  @IsNotEmpty()
  message: string;
}