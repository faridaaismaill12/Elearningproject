import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { NotificationGateway } from '../notifications.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  // notification.service.ts
        async createNotification(
            recipient: string | Types.ObjectId,
            message: string,
            type: string
        ): Promise<Notification> {
            const notification = new this.notificationModel({
                recipient: new Types.ObjectId(recipient),
                message,
                type,
                read: false,
            });

            return await notification.save();
        }




    async getNotifications(userId: string) {
    const objectId = new Types.ObjectId(userId); // Convert string to ObjectId
    const notifications = await this.notificationModel
        .find({ recipient: objectId })
        .sort({ createdAt: -1 })
        .exec();
    
    // console.log('Fetched Notifications:', notifications); // Debugging
    return notifications;
}

async markNotificationAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

}

async deleteNotification(notificationId: string) {
    return this.notificationModel.findByIdAndDelete(notificationId);
  }

}
