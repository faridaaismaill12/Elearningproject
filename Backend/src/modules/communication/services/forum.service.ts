import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { ForumThread } from '../schemas/forum-thread.schema';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(ForumThread.name) private forumThreadModel: Model<ForumThread>,
    ) {}

    // Create a new forum thread
    async create(createForumThreadDto: CreateForumThreadDto): Promise<ForumThread> {
        const forumThread = new this.forumThreadModel(createForumThreadDto);
        return forumThread.save();
    }

    // Find all forum threads
    async findAll(): Promise<ForumThread[]> {
        return this.forumThreadModel
            .find()
            .populate('course') // Populate course reference
            .populate('createdBy') // Populate user reference
            .populate('replies.user') // Populate users in top-level replies
            .populate('replies.replies.user') // Populate users in nested replies
            .exec();
    }

    // Find a specific forum thread by ID
    async findOne(id: string): Promise<ForumThread> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid ID: ${id}`);
        }

        const forum = await this.forumThreadModel
            .findById(id)
            .populate('course')
            .populate('createdBy')
            .populate('replies.user')
            .populate('replies.replies.user')
            .exec();

        if (!forum) {
            throw new BadRequestException(`Forum thread not found with ID: ${id}`);
        }

        return forum;
    }

    // Delete a forum thread by ID
    async delete(id: string): Promise<void> {
        await this.forumThreadModel.findByIdAndDelete(id).exec();
    }

    // Add a reply to a forum thread
    async addReply(
        threadId: string,
        userId: string,
        message: string,
    ): Promise<ForumThread> {
        const reply = {
            user: new Types.ObjectId(userId),
            message,
            timestamp: new Date(),
            replies: [], // Initialize an empty array for nested replies
        };
    
        const updatedThread = await this.forumThreadModel
            .findByIdAndUpdate(
                threadId,
                { $push: { replies: reply } },
                { new: true },
            )
            // .populate('replies.user') // Populate users in top-level replies
            .populate('replies.replies.user') // Populate users in nested replies
            .exec();
    
        if (!updatedThread) {
            throw new Error('Thread not found');
        }
        return updatedThread;
    }
    
    
    async addNestedReply(
        threadId: string,
        pathToReply: number[],
        userId: string,
        message: string,
    ): Promise<ForumThread> {
        if (!Types.ObjectId.isValid(threadId)) {
            throw new BadRequestException('Invalid threadId');
        }
    
        const thread = await this.forumThreadModel.findById(threadId);
        if (!thread) {
            throw new BadRequestException('Thread not found');
        }
    
        // Initialize `replies` if undefined
        thread.replies = thread.replies || [];
    
        // Recursive helper function to traverse and add the reply
        function addReply(replies: any[], path: number[]): any[] {
            if (path.length === 0) {
                replies.push({
                    user: new Types.ObjectId(userId),
                    message,
                    timestamp: new Date(),
                    replies: [],
                });
                return replies;
            }
            const index = path[0];
            if (!replies[index]) {
                throw new BadRequestException('Invalid path to reply');
            }
            replies[index].replies = replies[index].replies || [];
            replies[index].replies = addReply(replies[index].replies, path.slice(1));
            return replies;
        }
    
        thread.replies = addReply(thread.replies, [...pathToReply]);
    
        await thread.save();
        return thread;
    }
    
    
    
}
