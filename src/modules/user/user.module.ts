import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UsersService } from './user.service';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UsersService],
  controllers: [UserController],
  providers: [UsersService, ...validateConstraint],
})
export class UsersModule {}
