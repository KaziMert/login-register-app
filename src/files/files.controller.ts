import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Body,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { fileFilter } from './file-filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DecryptFileDto } from './dto/decrypt-file.dto';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dosya yükler, kullanıcının public key\'i ile şifreler' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user.userId;
    return this.filesService.uploadFile(file, userId);
  }

  @ApiOperation({ summary: 'Şifreli dosyayı private key ile çözer, dosyayı doğrudan döner (indirilebilir)' })
  @Post('decrypt/:fileId')
  async decryptFile(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Body() dto: DecryptFileDto,
    @Res() res: Response,
  ) {
    const result = await this.filesService.decryptFile(fileId, dto.privateKey);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.originalName}"`,
    });

    res.send(result.buffer);
  }
}