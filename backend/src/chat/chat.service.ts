import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, Message } from './schemas/chat.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createMessage(
    conversationId: string, 
    senderId: string, 
    text?: string, 
    type: string = 'text',
    location?: { lat: number; lng: number; address?: string },
    imageUrl?: string
  ) {
    const newMessage = new this.messageModel({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(senderId),
      text,
      type,
      location,
      imageUrl,
      status: 'sent',
    });
    
    const savedMessage = await newMessage.save();
    
    // Update last message in conversation
    const conversation = await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: savedMessage._id,
      updatedAt: new Date(),
    }).populate('participants');
    
    // Notify other participants
    if (conversation) {
      const otherParticipants = (conversation.participants as any[]).filter(p => p._id.toString() !== senderId);
      
      let notificationText = '';
      if (type === 'image') {
        notificationText = 'Sent you an image';
      } else if (type === 'location') {
        notificationText = 'Shared a location with you';
      } else {
        notificationText = text ? `"${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"` : 'Sent you a message';
      }

      for (const p of otherParticipants) {
        await this.notificationsService.create(
          p._id.toString(),
          'New Message',
          notificationText,
          'info',
          { type: 'chat', conversationId: conversationId }
        );
      }
    }
    
    return savedMessage;
  }

  async getConversations(userId: string) {
    // Cast to any for the filter to avoid Mongoose Query overload TS errors
    return this.conversationModel
      .find({ participants: { $in: [new Types.ObjectId(userId)] } } as any)
      .populate('participants', 'firstName lastName profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getAllConversations() {
    return this.conversationModel
      .find()
      .populate('participants', 'firstName lastName profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessages(conversationId: string) {
    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) } as any)
      .sort({ createdAt: 1 })
      .exec();
  }

  async findOrCreateConversation(participantIds: string[]) {
    const objectIds = participantIds.map(id => new Types.ObjectId(id));
    
    let conversation = await this.conversationModel.findOne({
      participants: { $all: objectIds },
    } as any);

    if (!conversation) {
      conversation = new this.conversationModel({
        participants: objectIds,
      });
      await conversation.save();
    }
    
    return conversation;
  }
}
