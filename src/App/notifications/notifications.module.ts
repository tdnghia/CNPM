import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { AppGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [AppGateway],
  // controllers: [NotificationsController],
})
export class NotificationsModule {}
