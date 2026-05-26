import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('admin/conversations')
  async getAllConversations() {
    return this.chatService.getAllConversations();
  }

  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('messages/:conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @Post('conversation')
  async startConversation(@Body() body: { participantIds: string[] }) {
    return this.chatService.findOrCreateConversation(body.participantIds);
  }
}
