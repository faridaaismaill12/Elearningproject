import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Injectable } from '@nestjs/common';
  
  @Injectable()
  @WebSocketGateway({ cors: { origin: '*' } })
  export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;
  
    private activeUsers: Map<string, string> = new Map(); // Maps userId to socketId
  
    handleConnection(client: Socket) {
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.activeUsers.set(userId, client.id);
        console.log(`User connected: ${userId}`);
      }
    }
  
    handleDisconnect(client: Socket) {
      for (const [userId, socketId] of this.activeUsers.entries()) {
        if (socketId === client.id) {
          this.activeUsers.delete(userId);
          console.log(`User disconnected: ${userId}`);
          break;
        }
      }
    }
  
    sendNotification(userId: string, message: string, type: string) {
      const socketId = this.activeUsers.get(userId);
      if (socketId) {
        this.server.to(socketId).emit('notification', { message, type });
      }
    }

    

  }
  