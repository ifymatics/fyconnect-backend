import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe, // Import ParseIntPipe
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices'; // Import MessagePattern and Payload
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard, UserDto, currentUser } from '@app/common';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @currentUser() user: UserDto,
  ) {
    return this.postsService.create(createPostDto, user._id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) { // Updated type and added ParseIntPipe
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto) { // Updated type and added ParseIntPipe
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) { // Updated type and added ParseIntPipe
    return this.postsService.remove(id);
  }

  // Handler for inter-service communication
  @MessagePattern({ cmd: 'get_post_by_id' })
  async getPostByIdForValidation(@Payload() data: { id: number }) {
    // The findOne service method throws NotFoundException if post is not found,
    // which NestJS should convert to an RpcException for microservice transport.
    try {
      const post = await this.postsService.findOne(data.id);
      return post; // Return the post if found (or just true if only validation is needed)
    } catch (error) {
      // Log the error or handle specifically if needed, otherwise let NestJS handle exception propagation
      // For example, if findOne throws NotFoundException, it will be converted to RpcException
      throw error;
    }
  }
}
