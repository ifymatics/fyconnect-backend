import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
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
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
