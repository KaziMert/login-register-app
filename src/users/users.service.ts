import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptedPrivateKey } from '../crypto/crypto.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(
    email: string,
    hashedPassword: string,
    publicKey: string,
    encryptedPrivateKey: EncryptedPrivateKey,
  ) {
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        publicKey,
        privateKey: {
          create: {
            iv: encryptedPrivateKey.iv,
            data: encryptedPrivateKey.data,
            salt: encryptedPrivateKey.salt,
            authTag: encryptedPrivateKey.authTag,
          },
        },
      },
      include: {
        privateKey: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        privateKey: true,
      },
    });
  }
}