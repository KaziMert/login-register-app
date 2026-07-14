import { BadRequestException } from '@nestjs/common';

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.docx', '.txt'];

export function fileFilter(req: any, file: Express.Multer.File, callback: Function) {
  const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return callback(
      new BadRequestException(
        `Bu dosya tipine izin verilmiyor: ${ext}. İzin verilenler: ${ALLOWED_EXTENSIONS.join(', ')}`,
      ),
      false,
    );
  }

  callback(null, true);
}