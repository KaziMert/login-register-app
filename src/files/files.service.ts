import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private uploadDir = path.join(__dirname, '..', '..', 'public', 'upload');

  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
  ) {}

  async uploadFile(file: Express.Multer.File, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const base64Data = file.buffer.toString('base64');
    const encrypted = this.cryptoService.encryptMessage(base64Data, user.publicKey);

    const storedName = `${crypto.randomUUID()}.enc`;
    const filePath = path.join(this.uploadDir, storedName);

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, encrypted.data, 'utf8');

    const savedFile = await this.prisma.file.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        storedName,
        encryptedKey: encrypted.encryptedKey,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        userId,
      },
    });

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    return {
      message: 'Dosya başarıyla yüklendi (şifreli)',
      fileId: savedFile.id,
      link: `${baseUrl}/upload/${storedName}`,
    };
  }

  async decryptFile(fileId: number, privateKey: string) {
    const fileRecord = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!fileRecord) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const filePath = path.join(this.uploadDir, fileRecord.storedName);
    const encryptedData = fs.readFileSync(filePath, 'utf8');

    const decryptedBase64 = this.cryptoService.decryptMessage(
      {
        encryptedKey: fileRecord.encryptedKey,
        iv: fileRecord.iv,
        authTag: fileRecord.authTag,
        data: encryptedData,
      },
      privateKey,
    );

    // base64'ü tekrar orijinal dosya baytlarına çevir
    const fileBuffer = Buffer.from(decryptedBase64, 'base64');

    return {
      buffer: fileBuffer,
      originalName: fileRecord.originalName,
      mimeType: fileRecord.mimeType,
    };
  }
}