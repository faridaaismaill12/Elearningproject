import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { ForumThread, Reply } from '../schemas/forum-thread.schema';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { UserService } from '../../user/user.service';

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(ForumThread.name) private forumThreadModel: Model<ForumThread>,
        @InjectModel(Reply.name) private replyModel: Model<Reply>,
        private userService: UserService, // Add this line
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


    private async verifyForumOwnership(threadId: string, userId: string): Promise<void> {
        const forumThread = await this.forumThreadModel.findById(threadId).exec();
        if (!forumThread) {
            throw new BadRequestException(`Forum thread not found with ID: ${threadId}`);
        }
        if (forumThread.createdBy.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to modify this forum thread.');
        }
    }

    // Verify ownership of a reply
    private async verifyReplyOwnership(replyId: string, userId: string): Promise<void> {
        const reply = await this.replyModel.findById(replyId).exec();
        if (!reply) {
            throw new BadRequestException(`Reply not found with ID: ${replyId}`);
        }
        if (reply.user.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to modify this reply.');
        }
    }

    // Delete a forum thread by ID with ownership check
    async delete(threadId: string, userId: string): Promise<void> {
        await this.verifyForumOwnership(threadId, userId);
        await this.forumThreadModel.findByIdAndDelete(threadId).exec();
    }

    // Update a forum thread (Ownership verified)
    async updateForum(threadId: string, userId: string, updateData: Partial<ForumThread>): Promise<ForumThread> {
        await this.verifyForumOwnership(threadId, userId);
        const updatedForumThread = await this.forumThreadModel.findByIdAndUpdate(threadId, updateData, { new: true }).exec();
        if (!updatedForumThread) {
            throw new BadRequestException(`Forum thread not found with ID: ${threadId}`);
        }
        return updatedForumThread;
    }

    // Update a reply (Ownership verified)
    async updateReply(replyId: string, userId: string, updateData: Partial<Reply>): Promise<Reply> {
        await this.verifyReplyOwnership(replyId, userId);
        const updatedReply = await this.replyModel.findByIdAndUpdate(replyId, updateData, { new: true }).exec();
        if (!updatedReply) {
            throw new BadRequestException(`Reply not found with ID: ${replyId}`);
        }
        return updatedReply;
    }

    async findAllByUserId(userId: string): Promise<(ForumThread & { replies: Reply[] })[]> {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException(`Invalid user ID: ${userId}`);
        }
    
        console.log('User ID:', userId);
    
        // Convert userId to ObjectId before querying
        const threads = await this.forumThreadModel.find({ createdBy: new Types.ObjectId(userId) }).exec();
    
        const threadsWithReplies = await Promise.all(
            threads.map(async (thread) => ({
                ...thread.toObject(),
                replies: await this.populateRepliesRecursively(
                    (thread.replies || []) as (Types.ObjectId | Reply)[],
                ),
            })),
        );
    
        return threadsWithReplies as (ForumThread & { replies: Reply[] })[];
    }
    
    async deleteForumThread(threadId: string, userId: string): Promise<void> {
        if (!isValidObjectId(threadId)) {
            throw new BadRequestException('Invalid thread ID');
        }
    
        const thread = await this.forumThreadModel.findById(threadId).exec();
    
        if (!thread) {
            throw new BadRequestException('Forum thread not found');
        }
    
        // Fetch the user's role
        const userRole = await this.userService.getUserRole(userId);
    
        // Check permissions
        if (
            thread.createdBy.toString() !== userId &&
            userRole !== 'admin' &&
            userRole !== 'instructor'
        ) {
            throw new UnauthorizedException('You do not have permission to delete this thread');
        }
    
        // Delete all associated replies
        await this.replyModel.deleteMany({ forumThread: threadId }).exec();
    
        // Delete the thread
        await this.forumThreadModel.findByIdAndDelete(threadId).exec();
    }

    async deleteReply(replyId: string, userId: string): Promise<void> {
        if (!isValidObjectId(replyId)) {
            throw new BadRequestException('Invalid reply ID');
        }
    
        const reply = await this.replyModel.findById(replyId).exec();
    
        if (!reply) {
            throw new BadRequestException('Reply not found');
        }
    
        // Fetch the user's role
        const userRole = await this.userService.getUserRole(userId);
    
        // Check permissions
        if (
            reply.user.toString() !== userId &&
            userRole !== 'admin' &&
            userRole !== 'instructor'
        ) {
            throw new UnauthorizedException('You do not have permission to delete this reply');
        }
    
        // Delete all nested replies
        const deleteNestedReplies = async (replyId: string) => {
            const nestedReplies = await this.replyModel.find({ parent: replyId }).exec();
            for (const nestedReply of nestedReplies) {
                await deleteNestedReplies((nestedReply._id as Types.ObjectId).toString());
            }
            await this.replyModel.findByIdAndDelete(replyId).exec();
        };
    
        await deleteNestedReplies(replyId);
    
        // Delete the top-level reply
        await this.replyModel.findByIdAndDelete(replyId).exec();
    }
    
    

    async findAllByCourseId(courseId: string): Promise<(ForumThread & { replies: Reply[] })[]> {
        if (!isValidObjectId(courseId)) {
            throw new BadRequestException(`Invalid course ID: ${courseId}`);
        }

        const threads = await this.forumThreadModel.find({ course: courseId }).exec();

        const threadsWithReplies = await Promise.all(
            threads.map(async (thread) => ({
                ...thread.toObject(),
                replies: await this.populateRepliesRecursively(
                    (thread.replies || []) as (Types.ObjectId | Reply)[],
                ),
            })),
        );

        return threadsWithReplies as (ForumThread & { replies: Reply[] })[];
    }
}

