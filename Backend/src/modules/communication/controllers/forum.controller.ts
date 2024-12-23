import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ForumService } from '../services/forum.service';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { ForumThread, Reply } from '../schemas/forum-thread.schema';
import { RolesGuard } from '../../security/guards/role.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { Types } from 'mongoose';
import { UserService } from '../../user/user.service';
import { CourseService } from '../../course/course.service';

@Controller('forums')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ForumController {
    constructor(
        private readonly forumService: ForumService,
        private readonly userService: UserService,
        private readonly courseService: CourseService,
    ) {}

    /**
     * Create a new forum thread
     */
    @Roles('student', 'instructor')
    @Post('create')
    async createForum(
        @Body() createForumThreadDto: CreateForumThreadDto,
        @Req() req: any,
    ): Promise<ForumThread> {
        const userId = req.user.id; // `userId` is already a string
        const { course } = createForumThreadDto;

        // Validate if user is enrolled in the course
        const courseData = await this.courseService.findCourseById(course);
        const isEnrolled = courseData.enrolledStudents?.includes(userId) ?? false;

        if (!isEnrolled) {
            throw new Error('You are not enrolled in this course.');
        }

        const forumData = {
            ...createForumThreadDto,
            createdBy: userId, // Pass userId as a string
        };

        return this.forumService.create(forumData); // Pass adjusted forumData
}


    /**
     * Fetch all forum threads
     */
    @Roles('student', 'instructor', 'admin')
    @Get()
    async findAllForums(): Promise<ForumThread[]> {
        return this.forumService.findAll();
    }

    /**
     * Fetch a specific forum thread by ID
     */
    @Roles('student', 'instructor', 'admin')
    @Get(':id')
    async findForumById(@Param('id') id: string): Promise<ForumThread> {
        return this.forumService.findOneWithReplies(id);
    }

    /**
     * Delete a forum thread
     */
    @Roles('instructor', 'student')
    @Delete(':threadId')
    async deleteForum(
        @Param('threadId') threadId: string,
        @Req() req: any,
    ): Promise<{ message: string }> {
        const userId = req.user.id;
        const userRole = req.user.role;

        await this.forumService.deleteForumThread(threadId, userId, userRole);

        return { message: 'Forum thread deleted successfully.' };
    }

    /**
     * Add a reply to a forum thread
     */
    @Roles('student', 'instructor', 'admin')
    @Post(':threadId/replies')
    async addReplyToThread(
        @Param('threadId') threadId: string,
        @Body() body: { message: string },
        @Req() req: any,
    ): Promise<Reply> {
        const userId = req.user.id;

        const forum = await this.forumService.findOneWithReplies(threadId);
        const courseData = await this.courseService.findCourseById(
            forum.course.toString(),
        );

        const isEnrolled = courseData.enrolledStudents?.includes(userId) ?? false;

        if (!isEnrolled) {
            throw new Error('You are not enrolled in this course.');
        }

        return this.forumService.addReplyToThread(threadId, userId, body.message);
    }

    /**
     * Add a reply to another reply (nested reply)
     */
    @Roles('student', 'instructor', 'admin')
    @Post('replies/:replyId')
    async addReplyToReply(
        @Param('replyId') replyId: string,
        @Body() body: { message: string },
        @Req() req: any,
    ): Promise<Reply> {
        const userId = req.user.id;

        const forumId = await this.forumService.findReplysForumById(replyId);
        const forum = await this.forumService.findOneWithReplies(forumId.toString());
        const courseData = await this.courseService.findCourseById(
            forum.course.toString(),
        );

        const isEnrolled = courseData.enrolledStudents?.includes(userId) ?? false;

        if (!isEnrolled) {
            throw new Error('You are not enrolled in this course.');
        }

        return this.forumService.addReplyToReply(replyId, userId, body.message);
    }

    /**
     * Delete a reply
     */
    @Roles('student', 'instructor', 'admin')
    @Delete('replies/:replyId')
    async deleteReply(
        @Param('replyId') replyId: string,
        @Req() req: any,
    ): Promise<{ message: string }> {
        const userId = req.user.id;
        const userRole = req.user.role;

        await this.forumService.deleteReply(replyId, userId, userRole);

        return { message: 'Reply deleted successfully.' };
    }

    /**
     * Update a forum thread
     */
    @Roles('student', 'instructor', 'admin')
    @Put(':id')
    async updateForum(
        @Param('id') id: string,
        @Body() updateData: Partial<ForumThread>,
        @Req() req: any,
    ): Promise<ForumThread> {
        const userId = req.user.id;

        const forum = await this.forumService.findOneWithReplies(id);
        const course = await this.courseService.findCourseById(forum.course.toString());

        // if (
        //     forum.createdBy.toString() !== userId &&
        //     course.instructor.toString() !== userId
        // ) {
        //     throw new Error('You are not authorized to update this forum.');
        // }

        return this.forumService.updateForum(id, userId, updateData);
    }

    /**
     * Update a reply
     */
    @Roles('student', 'instructor', 'admin')
    @Put('replies/:replyId')
    async updateReply(
        @Param('replyId') replyId: string,
        @Body() updateData: Partial<Reply>,
        @Req() req: any,
    ): Promise<Reply> {
        const userId = req.user.id;

        const reply = await this.forumService.findReplyById(replyId);
        const forumId = await this.forumService.findReplysForumById(replyId);
        const forum = await this.forumService.findOneWithReplies(forumId.toString());
        const course = await this.courseService.findCourseById(forum.course.toString());

        // if (
        //     reply.user.toString() !== userId &&
        //     course.instructor.toString() !== userId
        // ) {
        //     throw new Error('You are not authorized to update this reply.');
        // }

        return this.forumService.updateReply(replyId, userId, updateData);
    }

    /**
     * Fetch all forums by course ID
     */
    @Roles('student', 'instructor', 'admin')
    @Get('by-course/:courseId')
    async findForumsByCourseId(
        @Param('courseId') courseId: string,
    ): Promise<ForumThread[]> {
        return this.forumService.findAllByCourseId(courseId);
    }

    /**
     * Fetch all forums created by the current user
     */
    @Roles('student', 'instructor', 'admin')
    @Get('threads/by-user')
    async findForumsByUser(@Req() req: any): Promise<ForumThread[]> {
        const userId = req.user.id;

        return this.forumService.findAllByUserId(userId);
    }
}
