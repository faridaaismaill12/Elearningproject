import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Course } from '../../course/schemas/course.schema';
import { UserService } from '../../user/user.service';
import { CommunicationGateway } from '../communication.chatgateway';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { ForumThread, Reply } from '../schemas/forum-thread.schema';
import { NotificationService } from './notification.service';
import { CourseService } from '../../course/course.service';

@Injectable()
export class ForumService {
    constructor(
        @InjectModel(ForumThread.name) private forumThreadModel: Model<ForumThread>,
        @InjectModel(Reply.name) private replyModel: Model<Reply>,
        private userService: UserService,
        private readonly notificationService: NotificationService,
        private readonly communicationGateway: CommunicationGateway,
        private readonly courseService: CourseService,
    ) {}

    // Create a new forum thread
    async create(createForumThreadDto: CreateForumThreadDto): Promise<ForumThread> {
        const { course, createdBy } = createForumThreadDto;
    
        // Validate the course and get its details
        const courseData = await this.courseService.findCourseById(course);
        if (!courseData) {
            throw new NotFoundException('Course not found');
        }
    
        // Fetch the creator's profile (accepting both ObjectId and string)
        if (!createdBy) {
            throw new BadRequestException('Creator ID is required');
        }
        const creatorId = typeof createdBy === 'string' ? createdBy : createdBy.toString();
        const creator = await this.userService.viewProfile(creatorId);
        if (!creator) {
            throw new NotFoundException('Creator not found');
        }
    
        // Create the forum thread
        const forumThread = new this.forumThreadModel(createForumThreadDto);
        const savedForumThread = await forumThread.save();
    
        // If the creator is an instructor, send notifications to all enrolled students
        if (creator.role === 'instructor') {
            const enrolledStudents = courseData.enrolledStudents || [];
    
            // Send notifications to each student
            for (const studentId of enrolledStudents) {
                // Save the notification to the database
                const notification = await this.notificationService.createNotification(
                    studentId,
                    `New announcement from ${creator.name} in the course "${courseData.title}"`,
                    'ANNOUNCEMENT' // Notification type as defined in the schema
                );
    
                // Emit real-time notifications via the communication gateway
                await this.communicationGateway.emitNotification(studentId, notification as unknown as Notification);
            }
        }
    
        return savedForumThread;
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
        replies: (Types.ObjectId | Reply)[]
    ): Promise<Reply[]> {
        const populatedReplies: Reply[] = [];

        for (const reply of replies) {
            const populatedReply =
                typeof reply === "object" && "message" in reply
                    ? reply
                    : await this.replyModel
                        .findById(reply)
                        .populate("user", "name") // Populate the user with the name
                        .populate({
                            path: "replies",
                            model: "Reply",
                            select: "_id message user replies",
                            populate: { path: "user", select: "name" }, // Populate nested user names
                        })
                        .exec();

            if (!populatedReply) {
                continue;
            }

            const nestedReplies =
                (populatedReply.replies ?? []).length > 0
                    ? await this.populateRepliesRecursively(
                        (populatedReply.replies || []) as (Types.ObjectId | Reply)[]
                    )
                    : [];

            populatedReply.replies = nestedReplies;
            populatedReplies.push(populatedReply as Reply);
        }

        return populatedReplies;
    }



    async findReplyById(replyId: string): Promise<Reply> {
        if (!isValidObjectId(replyId)) {
            throw new BadRequestException('Invalid reply ID');
        }

        const reply = await this.replyModel.findById(replyId).exec();
        if (!reply) {
            throw new NotFoundException('Reply not found');
        }

        return reply;
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

        //get the user by email 
        const user = await this.userService.findUserById(userId);

        const course = thread.course as unknown as Course;

        // Check permissions: Thread creator or instructor of the course
        if (
            thread.createdBy.toString() !== userId &&
            course.instructor.toString() !== user.email 
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

    const reply = await this.replyModel.findById(replyId).populate('forumThread').exec();

    if (!reply) {
        throw new BadRequestException('Reply not found');
    }

    const thread = await this.forumThreadModel.findById(reply.forumThread).populate('course').exec();

    if (!thread) {
        throw new BadRequestException('Thread for this reply not found');
    }

    const course = thread.course as unknown as Course;
    const user = await this.userService.findUserById(userId);

    // Check permissions: Reply owner, Instructor of the course, or Admin
    if (
        reply.user.toString() !== userId && // If not the reply owner
        course.instructor.toString() !== user.email && // If not the course instructor
        userRole !== 'admin' // If not an admin
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
    async addReplyToThread(threadId: string, userId: string, message: string): Promise<Reply> {
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
        const thread = await this.forumThreadModel.findById(threadId).exec();

        if (!thread) {
            throw new NotFoundException('Forum thread not found');
        }

        await this.forumThreadModel.findByIdAndUpdate(threadId, {
            $push: { replies: savedReply._id },
        });

        // Notify thread owner
        const notification = await this.notificationService.createNotification(
            thread.createdBy,
            `Your thread "${thread.title}" received a reply.`,
            'REPLY'
        ) as unknown as Notification;

        await this.communicationGateway.emitNotification(thread.createdBy.toString(), notification as unknown as Notification);

        return savedReply;
    }
    

    // Add a reply to another reply (Nested Reply)
    async addReplyToReply(replyId: string, userId: string, message: string): Promise<Reply> {
        if (!isValidObjectId(replyId)) {
            throw new BadRequestException(`Invalid reply ID: ${replyId}`);
        }
    
        const parentReply = await this.replyModel.findById(replyId).populate('forumThread');
        if (!parentReply) {
            throw new NotFoundException(`Parent reply not found with ID: ${replyId}`);
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
    
        const thread = await this.forumThreadModel
            .findById(parentReply.forumThread)
            .populate({ path: 'replies', select: 'user' })
            .exec();
    
        if (!thread) {
            throw new NotFoundException('Thread for this reply not found');
        }
    
        const threadOwner = thread.createdBy.toString();
        const parentReplyOwner = parentReply.user.toString();
        const replyParticipants = (thread.replies || [])
            .map((reply: any) => reply.user?.toString())
            .filter(
                (participant: string | undefined) =>
                    participant && participant !== userId && participant !== parentReplyOwner
            );
    
        const allRecipients = new Set([threadOwner, parentReplyOwner, ...replyParticipants]);
    
        // Notify all recipients
        for (const recipient of allRecipients) {
            if (!recipient) continue;
    
            const notification = await this.notificationService.createNotification(
                recipient,
                `A new reply was added to the thread "${thread.title}".`,
                'REPLY'
            ) as unknown as Notification;
    
            await this.communicationGateway.emitNotification(recipient, notification as unknown as Notification);
        }
    
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
    // Update a forum thread (Ownership verified)
async updateForum(threadId: string, userId: string, updateData: Partial<ForumThread>): Promise<ForumThread> {
    if (!isValidObjectId(threadId)) {
        throw new BadRequestException('Invalid thread ID');
    }

    const thread = await this.forumThreadModel.findById(threadId).populate('course').exec();

    if (!thread) {
        throw new NotFoundException('Forum thread not found');
    }

    const course = thread.course as unknown as Course;

    // Fetch the user's role and email
    const user = await this.userService.viewProfile(userId);
    console.log(user);

    // Check permissions: Instructor of the course, or thread creator
    if (
        thread.createdBy.toString() !== userId &&
        course.instructor.toString() !== user.email
    ) {
        throw new UnauthorizedException('You do not have permission to update this forum thread');
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

    const reply = await this.replyModel.findById(replyId).populate('forumThread').exec();

    if (!reply) {
        throw new NotFoundException('Reply not found');
    }

    const thread = await this.forumThreadModel.findById(reply.forumThread).populate('course').exec();

    if (!thread) {
        throw new NotFoundException('Thread for this reply not found');
    }

    const course = thread.course as unknown as Course;

    // Fetch the user's role and email
    const user = await this.userService.viewProfile(userId);

    // Check permissions: Owner of the reply, Admin, or Instructor of the course
    if (
        reply.user.toString() !== userId &&
        course.instructor.toString() !== user.email
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

