import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com', description: 'Kullanıcının email adresi' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'En az 6 karakter olmalı' })
  @MinLength(6)
  password: string;
}