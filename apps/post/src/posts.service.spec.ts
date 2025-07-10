import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostRepository } from './repositories/post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostEntity } from './entities/post.entity';
import { UserDto } from '@app/common'; // Assuming UserDto is used for user context

// Mock PostRepository
const mockPostRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByUserId: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;
  let repository: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PostRepository,
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a post', async () => {
      const createPostDto: CreatePostDto = { desc: 'Test Post', image: 'test.jpg' };
      const userId = 'user123';
      const expectedPost = {
        id: 1,
        content: 'Test Post',
        imageUrl: 'test.jpg',
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      } as PostEntity;

      mockPostRepository.create.mockResolvedValue(expectedPost);

      const result = await service.create(createPostDto, userId);

      expect(mockPostRepository.create).toHaveBeenCalledWith({
        content: createPostDto.desc,
        imageUrl: createPostDto.image,
        userId,
      });
      expect(result).toEqual(expectedPost);
    });
  });

  // Add more basic unit tests for other methods like findOne, findAll etc.
  // For example:
  describe('findOne', () => {
    it('should find and return a post by id', async () => {
      const postId = 1;
      const expectedPost = { id: postId, content: 'Found Post' } as PostEntity;
      mockPostRepository.findOne.mockResolvedValue(expectedPost);

      const result = await service.findOne(postId);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expectedPost);
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = 999;
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(postId)).rejects.toThrow('Post with ID 999 not found');
    });
  });

});
