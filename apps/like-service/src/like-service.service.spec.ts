import { Test, TestingModule } from '@nestjs/testing';
import { LikeServiceService, CreateLikeDto } from './like-service.service';
import { LikeRepository } from './repositories/like.repository';
import { LikeEntity, LikeableEntityType } from './entities/like.entity';
import { ClientProxy } from '@nestjs/microservices';
import { POST_SERVICE, COMMENT_SERVICE } from './constants/services';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus, NotFoundException, ConflictException } from '@nestjs/common';

const mockLikeRepository = {
  create: jest.fn(),
  findOneByCriteria: jest.fn(),
  remove: jest.fn(),
  findByEntity: jest.fn(),
  countByEntity: jest.fn(),
  findByUserId: jest.fn(),
};

const mockPostServiceClient = { send: jest.fn() };
const mockCommentServiceClient = { send: jest.fn() };

describe('LikeServiceService', () => {
  let service: LikeServiceService;
  // let repository: LikeRepository; // Not strictly needed if only using mocks

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeServiceService,
        { provide: LikeRepository, useValue: mockLikeRepository },
        { provide: POST_SERVICE, useValue: mockPostServiceClient },
        { provide: COMMENT_SERVICE, useValue: mockCommentServiceClient },
      ],
    }).compile();

    service = module.get<LikeServiceService>(LikeServiceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addLike', () => {
    const userId = 'user123';
    const createPostLikeDto: CreateLikeDto = { entityId: 1, entityType: LikeableEntityType.POST };
    const expectedPostLike = { id: 1, userId, ...createPostLikeDto } as LikeEntity;

    it('should add a like if entity exists and not already liked', async () => {
      mockPostServiceClient.send.mockReturnValue(of({ id: createPostLikeDto.entityId })); // Post validation success
      mockLikeRepository.findOneByCriteria.mockResolvedValue(null); // Not already liked
      mockLikeRepository.create.mockResolvedValue(expectedPostLike);

      const result = await service.addLike(createPostLikeDto, userId);
      expect(mockPostServiceClient.send).toHaveBeenCalledWith({ cmd: 'get_post_by_id' }, { id: createPostLikeDto.entityId });
      expect(mockLikeRepository.findOneByCriteria).toHaveBeenCalledWith({ userId, ...createPostLikeDto });
      expect(mockLikeRepository.create).toHaveBeenCalledWith({ userId, ...createPostLikeDto });
      expect(result).toEqual(expectedPostLike);
    });

    it('should throw ConflictException if already liked', async () => {
      mockPostServiceClient.send.mockReturnValue(of({ id: createPostLikeDto.entityId }));
      mockLikeRepository.findOneByCriteria.mockResolvedValue(expectedPostLike); // Already liked

      await expect(service.addLike(createPostLikeDto, userId)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if entity validation fails (entity not found)', async () => {
      mockPostServiceClient.send.mockReturnValue(of(null)); // Post validation fails

      await expect(service.addLike(createPostLikeDto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw HttpException if entity validation service call errors', async () => {
        mockPostServiceClient.send.mockReturnValue(throwError(() => new Error('Service unavailable')));

        await expect(service.addLike(createPostLikeDto, userId))
          .rejects.toThrow(new HttpException(`Failed to validate ${createPostLikeDto.entityType} or service unavailable.`, HttpStatus.SERVICE_UNAVAILABLE));
      });
  });

  describe('removeLike', () => {
    const userId = 'user123';
    const entityId = 1;
    const entityType = LikeableEntityType.POST;
    const existingLike = { id: 1, userId, entityId, entityType } as LikeEntity;

    it('should remove a like if it exists', async () => {
      mockLikeRepository.findOneByCriteria.mockResolvedValue(existingLike);
      mockLikeRepository.remove.mockResolvedValue(undefined); // remove returns void

      await service.removeLike(entityId, entityType, userId);
      expect(mockLikeRepository.findOneByCriteria).toHaveBeenCalledWith({ userId, entityId, entityType });
      expect(mockLikeRepository.remove).toHaveBeenCalledWith(existingLike.id);
    });

    it('should throw NotFoundException if like to remove is not found', async () => {
      mockLikeRepository.findOneByCriteria.mockResolvedValue(null);
      await expect(service.removeLike(entityId, entityType, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
