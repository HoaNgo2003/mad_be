import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollow } from './entities/user-follow.entity';
import { UserFollowService } from './user-follow.service';
import { UsersModule } from '../user/user.module';
import { UserFollowController } from './user-follow.controller';
import { IsUserNotFoundContraints } from 'src/common/validators/user.validate';
import { NotificationModule } from '../notification/notification.module';
const validateConstraint = [IsUserNotFoundContraints];
@Module({
  imports: [
    TypeOrmModule.forFeature([UserFollow]),
    UsersModule,
    NotificationModule,
  ],
  exports: [UserFollowService],
  controllers: [UserFollowController],
  providers: [UserFollowService, ...validateConstraint],
})
export class UserFollowModule {}
