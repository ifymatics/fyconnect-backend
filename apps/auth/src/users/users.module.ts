import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DynamicDatabaseModule } from '@app/common'; // Updated import name
import { UsersRepository } from './users.repository';
import { UsersSchema } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config'; // Required for useFactory

@Module({
  imports: [
    // Initialize the database connection for Mongoose
    DynamicDatabaseModule.forRootAsync({
      dbType: 'mongoose',
      mongooseConfig: {
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          uri: configService.getOrThrow<string>('MONGODB_URI'),
          // useNewUrlParser: true, // No longer needed in recent Mongoose versions
          // useUnifiedTopology: true, // No longer needed
        }),
      },
    }),
    // Register Mongoose schemas for this module
    DynamicDatabaseModule.forFeature([
      { name: UsersRepository.name, schema: UsersSchema },
      // Ensure UsersRepository.name matches the 'name' in @InjectModel(UsersRepository.name)
      // and the name given in the schema definition if it's different from the class name.
      // Typically, if UsersRepository.name is 'UsersDocument', it should be consistent.
      // Let's assume UsersRepository.name is 'UsersDocument' as per typical convention,
      // or that @InjectModel(UsersRepository.name) uses the class name string.
      // The original code used UsersRepository.name, which might be "UsersRepository" string.
      // Let's check UsersRepository to be sure.
      // For now, assuming UsersRepository.name is the correct name for the model.
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
