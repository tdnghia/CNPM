import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGateway } from './notifications.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [AppGateway],
  // controllers: [NotificationsController],
})
export class NotificationsModule {}
