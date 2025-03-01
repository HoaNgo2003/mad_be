import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { UploadModule } from '../upload/upload.module';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([User]), UploadModule],
  exports: [UsersService],
  controllers: [UserController],
  providers: [UsersService, ...validateConstraint],
})
export class UsersModule {}
