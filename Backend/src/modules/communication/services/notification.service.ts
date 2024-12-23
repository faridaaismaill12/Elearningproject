import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, notificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationService {
constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<notificationDocument>
) {}

async createNotification(recipient: Types.ObjectId, type: string, message: string): Promise<notificationDocument> {
    const notification = new this.notificationModel({ recipient, type, message });
    return notification.save();
}

async markAsRead(notificationId: string): Promise<notificationDocument | null> {
    return this.notificationModel.findByIdAndUpdate(notificationId, { read: true }, { new: true }).exec();
}
}
