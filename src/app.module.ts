import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MessagesModule } from './messages/messages.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, MessagesModule, FilesModule],
})
export class AppModule {}