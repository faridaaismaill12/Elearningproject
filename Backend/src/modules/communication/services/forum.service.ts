import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { ForumThread, Reply } from '../schemas/forum-thread.schema';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { UserService } from '../../user/user.service';
import { Course } from '../../course/schemas/course.schema';

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(ForumThread.name) private forumThreadModel: Model<ForumThread>,
        @InjectModel(Reply.name) private replyModel: Model<Reply>,
        private userService: UserService,
    ) {}

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

        const forumThread = await this.forumThreadModel.findById(threadId).exec();

        if (!forumThread) {
            throw new BadRequestException(`Forum thread not found with ID: ${threadId}`);
        }

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
                continue;
            }

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

    // Delete a forum thread by ID with ownership check
    async deleteForumThread(threadId: string, userId: string, userRole: string): Promise<void> {
        if (!isValidObjectId(threadId)) {
            throw new BadRequestException('Invalid thread ID');
        }
    
        const thread = await this.forumThreadModel.findById(threadId).populate('course').exec();
    
        if (!thread) {
            throw new BadRequestException('Forum thread not found');
        }
    
        const course = thread.course as unknown as Course;
    
        // Check permissions: Thread creator or instructor of the course
        if (
            thread.createdBy.toString() !== userId &&
            course.instructor.toString() !== userId
        ) {
            throw new UnauthorizedException('You do not have permission to delete this thread');
        }
    
        // Delete all associated replies
        await this.replyModel.deleteMany({ forumThread: threadId }).exec();
    
        // Delete the thread
        await this.forumThreadModel.findByIdAndDelete(threadId).exec();
    }
    
    // Delete a reply by ID with ownership check
    async deleteReply(replyId: string, userId: string, userRole: string): Promise<void> {
        if (!isValidObjectId(replyId)) {
            throw new BadRequestException('Invalid reply ID');
        }
    
        const reply = await this.replyModel
            .findById(replyId)
            .populate('forumThread')
            .exec();
    
        if (!reply) {
            throw new BadRequestException('Reply not found');
        }
    
        const thread = await this.forumThreadModel.findById(reply.forumThread).populate('course').exec();
    
        if (!thread) {
            throw new BadRequestException('Thread for this reply not found');
        }
    
        const course = thread.course as unknown as Course;
    
        // Check permissions: Reply creator or instructor of the course
        if (
            reply.user.toString() !== userId &&
            course.instructor.toString() !== userId
        ) {
            throw new UnauthorizedException('You do not have permission to delete this reply');
        }
    
        // Recursively delete nested replies
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

        await this.replyModel.findByIdAndUpdate(replyId, {
            $push: { replies: savedReply._id },
        });

        return savedReply;
    }

    // Fetch threads by course ID
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

    // Fetch threads by user ID
    async findAllByUserId(userId: string): Promise<(ForumThread & { replies: Reply[] })[]> {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException(`Invalid user ID: ${userId}`);
        }

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


    // Update a forum thread (Ownership verified)
async updateForum(threadId: string, userId: string, updateData: Partial<ForumThread>): Promise<ForumThread> {
    if (!isValidObjectId(threadId)) {
        throw new BadRequestException('Invalid thread ID');
    }

    const thread = await this.forumThreadModel.findById(threadId).exec();

    if (!thread) {
        throw new NotFoundException('Forum thread not found');
    }

    // Fetch the user's role
    const userRole = await this.userService.getUserRole(userId);

    // Check permissions: Instructor of the course or Admin
    if (
        thread.createdBy.toString() !== userId &&
        userRole !== 'admin' &&
        !(userRole === 'instructor' && thread.course?.toString() === userId)
    ) {
        throw new ForbiddenException('You do not have permission to update this forum thread');
    }

    const updatedThread = await this.forumThreadModel.findByIdAndUpdate(threadId, updateData, { new: true }).exec();

    if (!updatedThread) {
        throw new NotFoundException('Failed to update forum thread');
    }

    return updatedThread;
}

// Update a reply (Ownership verified)
async updateReply(replyId: string, userId: string, updateData: Partial<Reply>): Promise<Reply> {
    if (!isValidObjectId(replyId)) {
        throw new BadRequestException('Invalid reply ID');
    }

    const reply = await this.replyModel.findById(replyId).exec();

    if (!reply) {
        throw new NotFoundException('Reply not found');
    }

    // Fetch the user's role
    const userRole = await this.userService.getUserRole(userId);

    // Check permissions: Owner of the reply, Admin, or Instructor of the course
    if (
        reply.user.toString() !== userId &&
        userRole !== 'admin' &&
        !(userRole === 'instructor' && reply.forumThread?.toString() === userId)
    ) {
        throw new ForbiddenException('You do not have permission to update this reply');
    }

    const updatedReply = await this.replyModel.findByIdAndUpdate(replyId, updateData, { new: true }).exec();

    if (!updatedReply) {
        throw new NotFoundException('Failed to update reply');
    }

    return updatedReply;
}


    async findReplysForumById(replyId: string): Promise<Types.ObjectId> {

    // Implement the logic to find a reply by its ID
    const reply = await this.replyModel.findById
    (replyId).exec();

    if (!reply || !reply.forumThread) {
        throw new NotFoundException('Forum thread not found for this reply');
    }
    return reply.forumThread;

    }

}

