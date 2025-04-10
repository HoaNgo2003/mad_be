import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
import { UploadModule } from '../upload/upload.module';
import { UserFollowModule } from '../user-follow/user.follow.module';
const validateConstraint = [];
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UploadModule,
    forwardRef(() => UserFollowModule),
  ],
  exports: [UsersService],
  controllers: [UserController],
  providers: [UsersService, ...validateConstraint],
})
export class UsersModule {}
