import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions, ModelDefinition } from '@nestjs/mongoose';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

interface MongooseAsyncConfig {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
}

interface TypeOrmAsyncConfig {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
}

export interface DatabaseAsyncConfig {
  dbType: 'mongoose' | 'typeorm';
  mongooseConfig?: MongooseAsyncConfig; // Used if dbType is 'mongoose'
  typeOrmConfig?: TypeOrmAsyncConfig;   // Used if dbType is 'typeorm'
}

@Module({})
export class DynamicDatabaseModule {
  static forRootAsync(config: DatabaseAsyncConfig): DynamicModule {
    if (config.dbType === 'mongoose') {
      if (!config.mongooseConfig) {
        throw new Error('mongooseConfig must be provided for dbType "mongoose"');
      }
      return {
        module: DynamicDatabaseModule,
        imports: [
          MongooseModule.forRootAsync({
            inject: config.mongooseConfig.inject,
            useFactory: config.mongooseConfig.useFactory,
          }),
        ],
        exports: [MongooseModule], // Export MongooseModule so forFeature can be used
      };
    } else if (config.dbType === 'typeorm') {
      if (!config.typeOrmConfig) {
        throw new Error('typeOrmConfig must be provided for dbType "typeorm"');
      }
      return {
        module: DynamicDatabaseModule,
        imports: [
          TypeOrmModule.forRootAsync({
            inject: config.typeOrmConfig.inject,
            useFactory: async (...args) => {
              const typeOrmOptions = await config.typeOrmConfig.useFactory(...args);
              // Ensure entities are not globally loaded here if autoLoadEntities is not used.
              // Services should use TypeOrmModule.forFeature() to load their specific entities.
              // If entities are passed in typeOrmOptions, TypeORM will try to load them.
              // It's often better to manage entities at the service level.
              return {
                ...typeOrmOptions,
                // autoLoadEntities: true, // Be cautious with this in a monorepo.
                                        // It's often better to explicitly list entities in forFeature.
              };
            },
          }),
        ],
        exports: [TypeOrmModule], // Export TypeOrmModule so forFeature can be used
      };
    } else {
      throw new Error('Invalid dbType specified. Must be "mongoose" or "typeorm".');
    }
  }

  // Keep Mongoose forFeature for convenience if services use it via this module
  static forFeature(models: ModelDefinition[], connectionName?: string): DynamicModule {
    return MongooseModule.forFeature(models, connectionName);
  }

  // Note: TypeOrmModule.forFeature is typically imported directly in the service's module
  // from @nestjs/typeorm. Adding a static wrapper here might be redundant but possible.
  // static forFeatureTypeOrm(entities: Function[] | string[], connectionName?: string): DynamicModule {
  //   return TypeOrmModule.forFeature(entities, connectionName);
  // }
}
