import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { DecryptMessagesDto } from './dto/decrypt-messages.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bir kullanıcıya şifreli mesaj gönderir (gönderen token\'dan alınır)' })
  @Post()
  sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    const senderId = req.user.userId;
    return this.messagesService.sendMessage(dto, senderId);
  }

  @ApiOperation({ summary: 'Kullanıcının tüm mesajlarını (şifreli halde) döner' })
  @Get(':userId')
  getMessages(@Param('userId', ParseIntPipe) userId: number) {
    return this.messagesService.getMessagesForUser(userId);
  }

  @ApiOperation({ summary: 'Private key ile kullanıcının mesajlarını çözüp açık halde döner' })
  @Post('decrypt')
  decryptMessages(@Body() dto: DecryptMessagesDto) {
    return this.messagesService.decryptMessages(dto);
  }
}