import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { ForumThread, Reply } from '../schemas/forum-thread.schema';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(ForumThread.name) private forumThreadModel: Model<ForumThread>,
        @InjectModel(Reply.name) private replyModel: Model<Reply>,
    ) { }

    // Create a new forum thread
    async create(createForumThreadDto: CreateForumThreadDto): Promise<ForumThread> {
        const forumThread = new this.forumThreadModel(createForumThreadDto);
        return forumThread.save();
    }

    // Find all forum threads
    async findAll(): Promise<(ForumThread & { replies: Reply[] })[]> {
        const forums = await this.forumThreadModel.find().exec();

        const forumsWithReplies = await Promise.all(
            forums.map(async (forum) => ({
                ...forum.toObject(),
                replies: await this.populateRepliesRecursively(
                    (forum.replies || []) as (Types.ObjectId | Reply)[],
                ),
            })),
        );

        return forumsWithReplies as (ForumThread & { replies: Reply[] })[];
    }

    // Find a specific forum thread by ID and load replies hierarchically
    async findOneWithReplies(threadId: string): Promise<ForumThread & { replies: Reply[] }> {
        if (!isValidObjectId(threadId)) {
            throw new BadRequestException(`Invalid thread ID: ${threadId}`);
        }

        // Fetch the forum thread
        const forumThread = await this.forumThreadModel.findById(threadId).exec();

        if (!forumThread) {
            throw new BadRequestException(`Forum thread not found with ID: ${threadId}`);
        }

        // Populate top-level replies hierarchically
        const populatedReplies = await this.populateRepliesRecursively(
            (forumThread.replies || []) as (Types.ObjectId | Reply)[],
        );

        return { ...forumThread.toObject(), replies: populatedReplies } as ForumThread & { replies: Reply[] };
    }

    // Helper: Populate replies recursively
    private async populateRepliesRecursively(
        replies: (Types.ObjectId | Reply)[],
    ): Promise<Reply[]> {
        const populatedReplies: Reply[] = [];

        for (const reply of replies) {
            // Fetch the reply if it's an ObjectId, or use it directly if it's already a Reply
            const populatedReply =
                typeof reply === 'object' && 'message' in reply
                    ? reply
                    : await this.replyModel
                        .findById(reply)
                        .populate({
                            path: 'replies',
                            model: 'Reply',
                            select: '_id message user replies',
                        })
                        .populate('user', 'name')
                        .exec();

            if (!populatedReply) {
                continue; // Skip if the reply could not be populated
            }

            // Recursively populate nested replies
            const nestedReplies =
                (populatedReply.replies ?? []).length > 0
                    ? await this.populateRepliesRecursively(
                        (populatedReply.replies || []) as (Types.ObjectId | Reply)[],
                    )
                    : [];

            populatedReply.replies = nestedReplies;
            populatedReplies.push(populatedReply as Reply);
        }

        return populatedReplies;
    }

    // Delete a forum thread by ID
    async delete(id: string): Promise<void> {
        await this.forumThreadModel.findByIdAndDelete(id).exec();
    }

    // Add a reply to a forum thread (Top-Level Reply)
    async addReplyToThread(
        threadId: string,
        userId: string,
        message: string,
    ): Promise<Reply> {
        if (!isValidObjectId(threadId)) {
            throw new BadRequestException(`Invalid thread ID: ${threadId}`);
        }

        const reply = new this.replyModel({
            user: new Types.ObjectId(userId),
            message,
            forumThread: new Types.ObjectId(threadId),
            parent: null,
        });

        const savedReply = await reply.save();

        // Add reply to thread's reply array
        await this.forumThreadModel.findByIdAndUpdate(threadId, {
            $push: { replies: savedReply._id },
        });

        return savedReply;
    }

    // Add a reply to another reply (Nested Reply)
    async addReplyToReply(
        replyId: string,
        userId: string,
        message: string,
    ): Promise<Reply> {
        if (!isValidObjectId(replyId)) {
            throw new BadRequestException(`Invalid reply ID: ${replyId}`);
        }

        const parentReply = await this.replyModel.findById(replyId);
        if (!parentReply) {
            throw new BadRequestException(`Parent reply not found with ID: ${replyId}`);
        }

        const reply = new this.replyModel({
            user: new Types.ObjectId(userId),
            message,
            forumThread: parentReply.forumThread,
            parent: new Types.ObjectId(replyId),
        });

        const savedReply = await reply.save();

        // Add reply to the parent reply's replies array
        await this.replyModel.findByIdAndUpdate(replyId, {
            $push: { replies: savedReply._id },
        });

        return savedReply;
    }

    // Get all top-level replies for a thread
    async getTopLevelReplies(threadId: string): Promise<Reply[]> {
        if (!isValidObjectId(threadId)) {
            throw new BadRequestException(`Invalid thread ID: ${threadId}`);
        }

        const forumThread = await this.forumThreadModel
            .findById(threadId)
            .populate({
                path: 'replies',
                model: 'Reply',
            })
            .exec();

        if (!forumThread) {
            throw new BadRequestException(`Forum thread not found with ID: ${threadId}`);
        }

        return forumThread.replies as unknown as Reply[];
    }

    // Get nested replies for a specific reply
    async getNestedReplies(replyId: string): Promise<Reply[]> {
        if (!isValidObjectId(replyId)) {
            throw new BadRequestException(`Invalid reply ID: ${replyId}`);
        }

        const parentReply = await this.replyModel
            .findById(replyId)
            .populate({
                path: 'replies',
                model: 'Reply',
            })
            .exec();

        if (!parentReply) {
            throw new BadRequestException(`Reply not found with ID: ${replyId}`);
        }

        return parentReply.replies as unknown as Reply[];
    }

    // Get a single reply with its parent and forum information
    async getReply(replyId: string): Promise<Reply> {
        if (!isValidObjectId(replyId)) {
            throw new BadRequestException(`Invalid reply ID: ${replyId}`);
        }

        const reply = await this.replyModel
            .findById(replyId)
            .populate('forumThread', '_id title')
            .populate('parent', '_id message user')
            .exec();

        if (!reply) {
            throw new BadRequestException(`Reply not found with ID: ${replyId}`);
        }

        return reply;
    }
}
