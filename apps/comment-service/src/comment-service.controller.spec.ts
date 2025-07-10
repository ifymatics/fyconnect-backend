import { Test, TestingModule } from '@nestjs/testing';
import { CommentServiceController } from './comment-service.controller';
import { CommentServiceService } from './comment-service.service';

describe('CommentServiceController', () => {
  let commentServiceController: CommentServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CommentServiceController],
      providers: [CommentServiceService],
    }).compile();

    commentServiceController = app.get<CommentServiceController>(CommentServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(commentServiceController.getHello()).toBe('Hello World!');
    });
  });
});
