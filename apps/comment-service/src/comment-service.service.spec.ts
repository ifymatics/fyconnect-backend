import { Test, TestingModule } from '@nestjs/testing';
import { CommentServiceService, CreateCommentDto } from './comment-service.service';
import { CommentRepository } from './repositories/comment.repository';
import { CommentEntity } from './entities/comment.entity';
import { ClientProxy } from '@nestjs/microservices';
import { POST_SERVICE } from './constants/services';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

const mockCommentRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  findByPostId: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockPostServiceClient = {
  send: jest.fn(),
};

describe('CommentServiceService', () => {
  let service: CommentServiceService;
  let repository: CommentRepository;
  let postClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentServiceService,
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: POST_SERVICE, useValue: mockPostServiceClient },
      ],
    }).compile();

    service = module.get<CommentServiceService>(CommentServiceService);
    repository = module.get<CommentRepository>(CommentRepository);
    postClient = module.get<ClientProxy>(POST_SERVICE);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    const createCommentDto: CreateCommentDto = { postId: 1, content: 'Test comment' };
    const userId = 'user123';
    const expectedComment = { id: 1, ...createCommentDto, userId, createdAt: new Date(), updatedAt: new Date() } as CommentEntity;

    it('should create a comment if post exists', async () => {
      mockPostServiceClient.send.mockReturnValue(of({ id: createCommentDto.postId })); // Post validation success
      mockCommentRepository.create.mockResolvedValue(expectedComment);

      const result = await service.createComment(createCommentDto, userId);

      expect(mockPostServiceClient.send).toHaveBeenCalledWith({ cmd: 'get_post_by_id' }, { id: createCommentDto.postId });
      expect(mockCommentRepository.create).toHaveBeenCalledWith({ ...createCommentDto, userId });
      expect(result).toEqual(expectedComment);
    });

    it('should throw HttpException if post validation fails (post not found)', async () => {
      mockPostServiceClient.send.mockReturnValue(of(null)); // Post validation fails (post is null)

      await expect(service.createComment(createCommentDto, userId))
        .rejects.toThrow(new HttpException('Post not found', HttpStatus.BAD_REQUEST));
      expect(mockCommentRepository.create).not.toHaveBeenCalled();
    });

    it('should throw HttpException if post service call errors', async () => {
      mockPostServiceClient.send.mockReturnValue(throwError(() => new Error('Service unavailable'))); // Post validation errors

      await expect(service.createComment(createCommentDto, userId))
        .rejects.toThrow(new HttpException('Failed to validate post or PostService unavailable', HttpStatus.SERVICE_UNAVAILABLE));
      expect(mockCommentRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getCommentById', () => {
    it('should return a comment if found', async () => {
      const commentId = 1;
      const expectedComment = { id: commentId, content: 'Found comment' } as CommentEntity;
      mockCommentRepository.findOne.mockResolvedValue(expectedComment);

      const result = await service.getCommentById(commentId);
      expect(mockCommentRepository.findOne).toHaveBeenCalledWith(commentId);
      expect(result).toEqual(expectedComment);
    });

    it('should throw NotFoundException if comment not found', async () => {
      const commentId = 999;
      mockCommentRepository.findOne.mockResolvedValue(null);

      await expect(service.getCommentById(commentId)).rejects.toThrow(NotFoundException);
    });
  });
});
