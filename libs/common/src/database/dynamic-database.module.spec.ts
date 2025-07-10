import { Test, TestingModule } from '@nestjs/testing';
import { DynamicDatabaseModule, DatabaseAsyncConfig } from './database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config'; // For mocking if needed in factories

// Mock the underlying NestJS modules
jest.mock('@nestjs/mongoose', () => ({
  MongooseModule: {
    forRootAsync: jest.fn().mockReturnValue({ module: 'MongooseModuleRegistered' }), // Return a simple identifiable object
    forFeature: jest.fn(),
  },
}));

jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRootAsync: jest.fn().mockReturnValue({ module: 'TypeOrmModuleRegistered' }), // Return a simple identifiable object
    forFeature: jest.fn(),
  },
}));


describe('DynamicDatabaseModule', () => {
  // Mock ConfigService for use in factories
  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  const mockMongooseUseFactory = jest.fn(() => ({ uri: 'mockMongoUri' }));
  const mockTypeOrmUseFactory = jest.fn(() => ({ type: 'postgres', host: 'mockHost' }) as any);


  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockConfigService.getOrThrow.mockReset();
  });

  describe('forRootAsync', () => {
    it('should configure MongooseModule when dbType is "mongoose"', () => {
      const config: DatabaseAsyncConfig = {
        dbType: 'mongoose',
        mongooseConfig: {
          inject: [ConfigService],
          useFactory: mockMongooseUseFactory,
        },
      };

      const dynamicModule = DynamicDatabaseModule.forRootAsync(config);

      expect(MongooseModule.forRootAsync).toHaveBeenCalledWith({
        inject: [ConfigService],
        useFactory: mockMongooseUseFactory,
      });
      expect(TypeOrmModule.forRootAsync).not.toHaveBeenCalled();
      expect(dynamicModule.imports).toContainEqual({ module: 'MongooseModuleRegistered' });
      expect(dynamicModule.exports).toContain(MongooseModule);
    });

    it('should configure TypeOrmModule when dbType is "typeorm"', async () => {
      const config: DatabaseAsyncConfig = {
        dbType: 'typeorm',
        typeOrmConfig: {
          inject: [ConfigService],
          useFactory: mockTypeOrmUseFactory,
        },
      };

      const dynamicModule = DynamicDatabaseModule.forRootAsync(config);

      // We need to simulate the resolution of the useFactory for TypeOrm to check the options transformation
      // However, the direct check here is that TypeOrmModule.forRootAsync is called correctly.
      expect(TypeOrmModule.forRootAsync).toHaveBeenCalledWith(expect.objectContaining({
        inject: [ConfigService],
        // The useFactory in the module wraps the provided one, so we check its existence
        useFactory: expect.any(Function),
      }));
      expect(MongooseModule.forRootAsync).not.toHaveBeenCalled();
      expect(dynamicModule.imports).toContainEqual({ module: 'TypeOrmModuleRegistered' });
      expect(dynamicModule.exports).toContain(TypeOrmModule);

      // Test the wrapped useFactory
      const typeOrmModuleAsyncOptions = (TypeOrmModule.forRootAsync as jest.Mock).mock.calls[0][0];
      const factoryResult = await typeOrmModuleAsyncOptions.useFactory(mockConfigService);
      expect(mockTypeOrmUseFactory).toHaveBeenCalledWith(mockConfigService);
      expect(factoryResult).toEqual({ type: 'postgres', host: 'mockHost' }); // Ensure original options are returned
    });

    it('should throw error if dbType is "mongoose" but mongooseConfig is missing', () => {
      const config: any = { dbType: 'mongoose' }; // Missing mongooseConfig
      expect(() => DynamicDatabaseModule.forRootAsync(config))
        .toThrow('mongooseConfig must be provided for dbType "mongoose"');
    });

    it('should throw error if dbType is "typeorm" but typeOrmConfig is missing', () => {
      const config: any = { dbType: 'typeorm' }; // Missing typeOrmConfig
      expect(() => DynamicDatabaseModule.forRootAsync(config))
        .toThrow('typeOrmConfig must be provided for dbType "typeorm"');
    });

    it('should throw error for invalid dbType', () => {
      const config: any = { dbType: 'invalidSql' };
      expect(() => DynamicDatabaseModule.forRootAsync(config))
        .toThrow('Invalid dbType specified. Must be "mongoose" or "typeorm".');
    });
  });

  describe('forFeature (Mongoose)', () => {
    it('should call MongooseModule.forFeature', () => {
      const models = [{ name: 'TestModel', schema: {} as any }];
      DynamicDatabaseModule.forFeature(models, 'testConnection');
      expect(MongooseModule.forFeature).toHaveBeenCalledWith(models, 'testConnection');
    });
  });
});
