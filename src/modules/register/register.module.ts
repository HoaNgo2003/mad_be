import { Module } from '@nestjs/common';
import {
  IsUserExistContraints,
  IsUserNotFoundContraints,
} from 'src/common/validators/user.validate';
import { UserVerifyAccountModule } from '../user-verify-account/user-verify-account.module';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserVerifyAccount } from '../user-verify-account/entities/user-verify-account.entity';
import { UsersModule } from '../user/user.module';

const validateConstraint = [IsUserExistContraints, IsUserNotFoundContraints];

@Module({
  imports: [
    UserVerifyAccountModule,
    UsersModule,
    TypeOrmModule.forFeature([User, UserVerifyAccount]),
  ],
  controllers: [RegisterController],
  providers: [...validateConstraint, RegisterService],
})
export class RegisterModule {}
