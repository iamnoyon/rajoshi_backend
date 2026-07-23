import { InjectRepository } from '@nestjs/typeorm';
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
import { Message } from 'src/entities/message.entity';
import { Repository } from 'typeorm';

@WebSocketGateway({ cors: { origin: 'http://localhost:3001' } })
export class SocketService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const messages = await this.messageRepository.find({});
    client.emit('onMessage', messages);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { senderId: string; receiverId: string; message: string },
  ) {
    const message = this.messageRepository.create({
      sender_id: data.senderId,
      receiver_id: data.receiverId,
      message: data.message,
    });

    const savedMessage = await this.messageRepository.save(message);

    this.server.emit('message', savedMessage);
  }
}
