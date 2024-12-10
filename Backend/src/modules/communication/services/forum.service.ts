import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ForumThread } from '../schemas/forum-thread.schema';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { UpdateForumThreadDto } from '../dto/update-forum-thread.dto';

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(ForumThread.name) private forumThreadModel: Model<ForumThread>,
    ) { }

    // Create a new forum thread
    async create(createForumThreadDto: CreateForumThreadDto): Promise<ForumThread> {
        const forumThread = new this.forumThreadModel(createForumThreadDto);
        return forumThread.save();
    }
    // Find all forum threads
    async findAll(): Promise<ForumThread[]> {
        return this.forumThreadModel
            .find()
            // .populate('course') // Populate course reference
            // .populate('createdBy') // Populate user reference
            .exec();
    }

    // Find a specific forum thread by ID
    async findOne(id: string): Promise<ForumThread> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException(`Invalid ID: ${id}`);
        }
        const forum = await this.forumThreadModel
            .findById(id)
            // .populate('course')
            // .populate('createdBy')
            // .populate('replies.user')
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
            user: userId,
            message,
            timestamp: new Date(),
        };

        const addedreply = await this.forumThreadModel
            .findByIdAndUpdate(
                threadId,
                { $push: { replies: reply } },
                { new: true },
            )
            // .populate('replies.user') // Populate user references in replies
            .exec();

        if (!addedreply) {
            throw new Error('Thread not found');
        }
        return addedreply;
    }
}
