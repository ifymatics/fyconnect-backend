import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersDocument } from './schemas/user.schema'; // Mongoose document
import * as bcrypt from 'bcryptjs';

// Mock UsersRepository
const mockUsersRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  // ... other methods if needed
};

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
  hash: jest.fn(),
}));


describe('UsersService', () => {
  let service: UsersService;
  // let repository: UsersRepository; // Not strictly needed if only using mocks

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and create a user', async () => {
      const createUserDto: CreateUserDto = { email: 'test@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      const expectedUser = {
        _id: 'someMongoId',
        email: createUserDto.email,
        password: hashedPassword
      } as unknown as UsersDocument; // Cast needed due to Mongoose document structure

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersRepository.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
      });
      expect(result).toEqual(expectedUser);
    });
  });

  // Add more tests, e.g., for getUser
  describe('getUser', () => {
    it('should find and return a user', async () => {
      const filterQuery = { email: 'test@example.com' };
      const expectedUser = { _id: 'someId', email: 'test@example.com' } as UsersDocument;
      mockUsersRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.getUser(filterQuery);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith(filterQuery);
      expect(result).toEqual(expectedUser);
    });
  });

});
