import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { CryptoModule } from '../crypto/crypto.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CryptoModule, AuthModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}