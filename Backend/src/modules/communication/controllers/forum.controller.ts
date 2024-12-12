import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ForumService } from '../services/forum.service';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { ForumThread, Reply } from '../schemas/forum-thread.schema';
import { RolesGuard } from '../../security/guards/role.guard'; // Import RolesGuard
import { Roles } from '../../../decorators/roles.decorator'; // Import Roles decorator
import { Types } from 'mongoose';
import { UserService } from '../../user/user.service';
import { CourseService } from '../../course/course.service';
@Controller('forums')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply both guards to all routes
export class ForumController {
    constructor(private readonly forumService: ForumService,
                private readonly userService: UserService,
                private readonly courseService: CourseService,
    ) {}

    @Roles('student', 'instructor') // Allow all roles to create a forum thread
    @Post('create')
    async create(@Body() createForumThreadDto: CreateForumThreadDto, @Req() req: any) {

        
        // console.log(isEnrolled);
        
        // console.log(user);
        // const userCourses = user.enrolledCourses;
        // console.log(userCourses);
        // const isEnrolled = userCourses?.includes(new Types.ObjectId(courseId)) ?? false;
        // console.log(isEnrolled);
        try{
                const userId = req.user.id; // Extract user ID from token
            const courseId = createForumThreadDto.course;
            // Check that the user is enrolled in the course
            const user = await this.userService.viewProfile(userId);
            const course = await this.courseService.findCourseById(courseId); 
            // console.log( );
                const isEnrolled = course.enrolledStudents?.includes(userId) ?? false;

            if(!isEnrolled) {
                throw new Error('You are not enrolled in this course');

            }

            const forumData = {
                ...createForumThreadDto,
                createdBy: new Types.ObjectId(userId), // Ensure it's a valid ObjectId
            };
            return this.forumService.create(forumData);

            
        } catch (error) {
            throw new Error('You are not enrolled in this course');
        }
        
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to view forum threads
    @Get()
    async findAll() {
        return this.forumService.findAll();
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to view specific threads
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.forumService.findOneWithReplies(id);
    }

    @Roles('instructor', 'admin') // Only instructors and admins can delete forum threads
    @Delete(':threadId')
    async deleteForumThread(@Param('threadId') threadId: string, @Req() req: any) {
        const userId = req.user.id; // Extract user ID from token
        const userRole = req.user.role; // Extract role from token if available
        await this.forumService.deleteForumThread(threadId, userId, userRole);
        return { message: 'Forum thread deleted successfully' };
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to delete their replies
    @Delete('replies/:replyId')
    async deleteReply(@Param('replyId') replyId: string, @Req() req: any) {
        const userId = req.user.id; // Extract user ID from token
        const userRole = req.user.role; // Extract role from token if available
        await this.forumService.deleteReply(replyId, userId, userRole);
        return { message: 'Reply deleted successfully' };
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to add replies to threads
    @Post(':threadId/replies')
    async addReplyToThread(
        @Param('threadId') threadId: string,
        @Body() body: { message: string },
        @Req() req: any,
    ) {
        

        try{

            const userId = req.user.id; // Extract user ID from token
            
            const courseId = (await this.forumService.findOneWithReplies(threadId)).course;
            // Check that the user is enrolled in the course
            const user = await this.userService.viewProfile(userId);
            const course = await this.courseService.findCourseById(courseId.toString());

            // console.log( );
            const isEnrolled = course.enrolledStudents?.includes(userId) ?? false;


            if(!isEnrolled) {
                throw new Error('You are not enrolled in this course');
            }

            return this.forumService.addReplyToThread(threadId, userId, body.message);
        } catch (error) {
            throw new Error('You are not enrolled in this course');
        }
        
        
        // Extract user ID from token
        
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to add nested replies
    @Post('replies/:replyId')
    async addReplyToReply(
        @Param('replyId') replyId: string,
        @Body() body: { message: string },
        @Req() req: any,
    ) {
        try{

            const userId = req.user.id; // Extract user ID from token
            const forum = await this.forumService.findReplysForumById(replyId);
            const courseId = (await this.forumService.findOneWithReplies(forum._id.toString())).course;
            // Check that the user is enrolled in the course
            const user = await this.userService.viewProfile(userId);
            const course = await this.courseService.findCourseById(courseId.toString());

            // console.log( );
            const isEnrolled = course.enrolledStudents?.includes(userId) ?? false;


            if(!isEnrolled) {
                throw new Error('You are not enrolled in this course');
            }

            return this.forumService.addReplyToReply(replyId, userId, body.message);
        } catch (error) {
            throw new Error('You are not enrolled in this course');
        }
        
        
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to update their own forum threads
    @Put(':id')
    async updateForum(
        @Param('id') id: string,
        @Body() updateData: Partial<ForumThread>,
        @Req() req: any,
    ) {
        const userId = req.user.id; // Extract user ID from token
        return this.forumService.updateForum(id, userId, updateData);
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to update their own replies
    @Put('replies/:replyId')
    async updateReply(
        @Param('replyId') replyId: string,
        @Body() updateData: Partial<Reply>,
        @Req() req: any,
    ) {
        const userId = req.user.id; // Extract user ID from token
        return this.forumService.updateReply(replyId, userId, updateData);
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to view threads by course
    @Get('by-course/:courseId')
    async findAllByCourseId(@Param('courseId') courseId: string) {
        return this.forumService.findAllByCourseId(courseId);
    }

    @Roles('student', 'instructor', 'admin') // Allow all roles to view their own threads
    @Get('threads/by-user')
    async findAllByUserId(@Req() req: any) {
        const userId = req.user.id; // Extract user ID from the token
        return this.forumService.findAllByUserId(userId);
    }
}
