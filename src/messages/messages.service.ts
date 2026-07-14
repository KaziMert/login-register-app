import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import { SendMessageDto } from './dto/send-message.dto';
import { DecryptMessagesDto } from './dto/decrypt-messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
  ) {}

  async sendMessage(dto: SendMessageDto, senderId: number) {
    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Alıcı kullanıcı bulunamadı');
    }

    const encrypted = this.cryptoService.encryptMessage(
      dto.message,
      receiver.publicKey,
    );

    return this.prisma.message.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        encryptedKey: encrypted.encryptedKey,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        data: encrypted.data,
      },
    });
  }

  async getMessagesForUser(userId: number) {
    return this.prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async decryptMessages(dto: DecryptMessagesDto) {
    const messages = await this.getMessagesForUser(dto.userId);

    return messages.map((msg) => {
      try {
        const plainText = this.cryptoService.decryptMessage(
          {
            encryptedKey: msg.encryptedKey,
            iv: msg.iv,
            authTag: msg.authTag,
            data: msg.data,
          },
          dto.privateKey,
        );

        return {
          id: msg.id,
          message: plainText,
          createdAt: msg.createdAt,
        };
      } catch (error) {
        return {
          id: msg.id,
          message: '[Çözülemedi - yanlış private key]',
          createdAt: msg.createdAt,
        };
      }
    });
  }
}