import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [SocketService],
  exports: [SocketService],
})
export class SocketModule {}
