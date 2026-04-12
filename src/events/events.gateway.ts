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
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,https://eventra-frontend-eight.vercel.app').split(',').map(o => o.trim()).filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() { }

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

  handleDisconnect(client: Socket) { }

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
    // Emit to customer if userId (Firebase UID) is present
    if (notification.userId) {
      this.server.to(notification.userId).emit('notificationCreated', notification);
    }

    // Emit to vendor using vendorUserId (Firebase UID), not vendorId (MongoDB ObjectId)
    if (notification.vendorUserId && notification.vendorUserId !== notification.userId) {
      this.server.to(notification.vendorUserId).emit('notificationCreated', notification);
    }
  }
}
