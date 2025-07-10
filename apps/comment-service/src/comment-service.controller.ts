import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices'; // Import MessagePattern, Payload
import { CommentServiceService, CreateCommentDto, UpdateCommentDto } from './comment-service.service';
import { JwtAuthGuard, UserDto, currentUser } from '@app/common';
import { CommentEntity } from './entities/comment.entity';

@Controller('comments') // Base path for comments
export class CommentServiceController {
  constructor(private readonly commentServiceService: CommentServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createCommentDto: CreateCommentDto,
    @currentUser() user: UserDto,
  ): Promise<CommentEntity> {
    // user._id should come from the JWT payload via UserDto
    return this.commentServiceService.createComment(createCommentDto, user._id);
  }

  @Get() // Get comments by postId: /comments?postId=123
  @UseGuards(JwtAuthGuard) // Or make public if comments can be viewed by anyone
  getCommentsByPostId(@Query('postId', ParseIntPipe) postId: number): Promise<CommentEntity[]> {
    return this.commentServiceService.getCommentsByPostId(postId);
  }

  @Get('user/:userId') // Get comments by specific userId (e.g., for a user's profile)
  @UseGuards(JwtAuthGuard)
  getCommentsByUserId(@Param('userId') userId: string): Promise<CommentEntity[]> {
    return this.commentServiceService.getCommentsByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) // Or public
  getCommentById(@Param('id', ParseIntPipe) id: number): Promise<CommentEntity> {
    return this.commentServiceService.getCommentById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @currentUser() user: UserDto,
  ): Promise<CommentEntity> {
    return this.commentServiceService.updateComment(id, updateCommentDto, user._id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @currentUser() user: UserDto,
  ): Promise<void> {
    return this.commentServiceService.deleteComment(id, user._id);
  }

  // An internal or admin endpoint might be needed for deleting all comments of a post
  // For example: @Delete('post/:postId') for admin use

  @MessagePattern({ cmd: 'get_comment_by_id' })
  async getCommentByIdForValidation(@Payload() data: { id: number }): Promise<CommentEntity> {
    try {
      // The service method getCommentById throws NotFoundException if not found.
      // NestJS will convert this to an RpcException for microservice transport.
      return await this.commentServiceService.getCommentById(data.id);
    } catch (error) {
      throw error; // Re-throw the exception (e.g., NotFoundException as RpcException)
    }
  }
}
