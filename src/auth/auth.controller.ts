import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { DecryptKeyDto } from './dto/decrypt-key.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Yeni kullanıcı kaydı oluşturur' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Kullanıcı girişi yapar, JWT token döner' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Kayıtlı private key\'i şifre ile çözer' })
  @Post('decrypt-key')
  decryptKey(@Body() dto: DecryptKeyDto) {
    return this.authService.decryptPrivateKey(dto);
  }
}