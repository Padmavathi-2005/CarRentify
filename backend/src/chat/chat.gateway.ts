import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  path: process.env.API_PREFIX ? `/${process.env.API_PREFIX}/socket.io` : '/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(data.conversationId);
    console.log(`Client ${client.id} joined room ${data.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { 
      conversationId: string; 
      senderId: string; 
      text?: string;
      type?: string;
      location?: { lat: number; lng: number; address?: string };
      imageUrl?: string;
    },
  ) {
    const message = await this.chatService.createMessage(
      data.conversationId,
      data.senderId,
      data.text,
      data.type || 'text',
      data.location,
      data.imageUrl
    );

    // Broadcast message to everyone in the room (conversation)
    this.server.to(data.conversationId).emit('newMessage', message);
    
    // Also notify about conversation update for the sidebar list
    this.server.emit('conversationUpdated', { 
      conversationId: data.conversationId,
      lastMessage: message 
    });
  }
}
