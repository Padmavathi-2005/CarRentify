import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  path: process.env.API_PREFIX ? `/${process.env.API_PREFIX}/socket.io` : '/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userIdQuery = client.handshake.query.userId as string;
    if (userIdQuery) {
      const userIds = userIdQuery.split(',');
      for (const userId of userIds) {
        if (userId) {
          client.join(`user_${userId}`);
          console.log(`User ${userId} joined room user_${userId} on socket ${client.id}`);
        }
      }
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ${client.id} disconnected`);
  }

  sendNotification(userId: string, event: string, data: any) {
    const rawData = data && typeof data.toJSON === 'function' ? data.toJSON() : data;
    const payload = typeof rawData === 'object' && rawData !== null ? { ...rawData, targetUserId: userId } : rawData;
    this.server.to(`user_${userId}`).emit(event, payload);
  }
}
