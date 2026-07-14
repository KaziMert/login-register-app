import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../crypto/crypto.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { DecryptKeyDto } from './dto/decrypt-key.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Bu email zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { publicKey, privateKey } = this.cryptoService.generateKeyPair();

    const encryptedPrivateKey = this.cryptoService.encryptPrivateKey(
      privateKey,
      dto.password,
    );

    const user = await this.usersService.create(
      dto.email,
      hashedPassword,
      publicKey,
      encryptedPrivateKey,
    );

    return {
      message: 'Kayıt başarılı',
      userId: user.id,
      publicKey: user.publicKey,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
    };
  }

  async decryptPrivateKey(dto: DecryptKeyDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    if (!user.privateKey) {
      throw new UnauthorizedException('Private key bulunamadı');
    }

    try {
      const privateKey = this.cryptoService.decryptPrivateKey(
        {
          iv: user.privateKey.iv,
          data: user.privateKey.data,
          salt: user.privateKey.salt,
          authTag: user.privateKey.authTag,
        },
        dto.password,
      );

      return { privateKey };
    } catch (error) {
      throw new UnauthorizedException('Private key çözülemedi');
    }
  }
}