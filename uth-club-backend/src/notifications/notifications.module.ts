import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService], // exported so other modules can fire notifications
})
export class NotificationsModule { }
