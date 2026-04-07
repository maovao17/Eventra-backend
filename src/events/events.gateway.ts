import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as admin from 'firebase-admin';

type SocketUser = {
  uid: string;
  email: string | null;
};

type AuthSocket = Socket & { data: { user?: SocketUser } };


@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit() {}

  async handleConnection(client: AuthSocket) {
    const token = client.handshake.auth?.token;

    if (!token) {
      client.emit('unauthorized', 'No token provided');
      client.disconnect(true);
      return;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;
      
      client.data.user = {
        uid: userId,
        email: decodedToken.email || null,
      };
      client.join(userId);
    } catch {
      client.emit('unauthorized', 'Invalid token');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {}

  broadcastBookingUpdate(booking: {
    bookingId: string
    status: string
    vendorId: string
    vendorUserId?: string
    customerId: string
  }) {
    this.server
      .to(booking.customerId)
      .emit('bookingStatusUpdated', booking);

    this.server
      .to(booking.vendorUserId || booking.vendorId)
      .emit('bookingStatusUpdated', booking);
  }

  broadcastNotification(notification: { 
    message: string
    type: string
    bookingId?: string
    vendorId?: string
    vendorUserId?: string
    userId?: string 
  }) {
    const targetUserId =
      notification.userId || notification.vendorUserId || notification.vendorId;

    if (!targetUserId) {
      return;
    }

    this.server
      .to(targetUserId)
      .emit('notificationCreated', notification);
  }
}
