import { Test, TestingModule } from '@nestjs/testing';
import { LikeServiceController } from './like-service.controller';
import { LikeServiceService } from './like-service.service';

describe('LikeServiceController', () => {
  let likeServiceController: LikeServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LikeServiceController],
      providers: [LikeServiceService],
    }).compile();

    likeServiceController = app.get<LikeServiceController>(LikeServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(likeServiceController.getHello()).toBe('Hello World!');
    });
  });
});
