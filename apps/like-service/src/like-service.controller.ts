import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Param,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { LikeServiceService, CreateLikeDto } from './like-service.service';
import { JwtAuthGuard, UserDto, currentUser } from '@app/common';
import { LikeEntity, LikeableEntityType } from './entities/like.entity';

@Controller('likes')
export class LikeServiceController {
  constructor(private readonly likeServiceService: LikeServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  addLike(
    @Body() createLikeDto: CreateLikeDto,
    @currentUser() user: UserDto,
  ): Promise<LikeEntity> {
    return this.likeServiceService.addLike(createLikeDto, user._id);
  }

  // For DELETE, it's common to pass entityId and entityType as query params or part of the path
  // Path: /likes/post/123 or /likes/comment/456
  // Query: /likes?entityId=123&entityType=POST
  // Using query parameters here for flexibility.
  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeLike(
    @Query('entityId', ParseIntPipe) entityId: number,
    @Query('entityType') entityType: LikeableEntityType, // Add validation pipe for enum later if needed
    @currentUser() user: UserDto,
  ): Promise<void> {
    if (!Object.values(LikeableEntityType).includes(entityType)) {
        throw new HttpException('Invalid entity type provided.', HttpStatus.BAD_REQUEST);
    }
    return this.likeServiceService.removeLike(entityId, entityType, user._id);
  }

  @Get() // Get likes for a specific entity: /likes?entityId=123&entityType=POST
  getLikesForEntity(
    @Query('entityId', ParseIntPipe) entityId: number,
    @Query('entityType') entityType: LikeableEntityType,
  ): Promise<{ likes: LikeEntity[], count: number }> {
    if (!Object.values(LikeableEntityType).includes(entityType)) {
        throw new HttpException('Invalid entity type provided.', HttpStatus.BAD_REQUEST);
    }
    return this.likeServiceService.getLikesForEntity(entityId, entityType);
  }

  @Get('user/:userId') // Get all entities liked by a specific user
  @UseGuards(JwtAuthGuard)
  getLikesByUserId(@Param('userId') userId: string): Promise<LikeEntity[]> {
      return this.likeServiceService.getLikesByUserId(userId);
  }

  @Get('has-liked') // Check if current user has liked an entity: /likes/has-liked?entityId=123&entityType=POST
  @UseGuards(JwtAuthGuard)
  hasUserLikedEntity(
    @Query('entityId', ParseIntPipe) entityId: number,
    @Query('entityType') entityType: LikeableEntityType,
    @currentUser() user: UserDto,
  ): Promise<boolean> {
    if (!Object.values(LikeableEntityType).includes(entityType)) {
        throw new HttpException('Invalid entity type provided.', HttpStatus.BAD_REQUEST);
    }
    return this.likeServiceService.hasUserLikedEntity(user._id, entityId, entityType);
  }
}
