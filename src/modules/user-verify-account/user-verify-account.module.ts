import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserVerifyAccount } from './entities/user-verify-account.entity';
import { UserVerifyAccountService } from './user-verify-account.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserVerifyAccount])],
  providers: [UserVerifyAccountService],
  exports: [UserVerifyAccountService],
  controllers: [],
})
export class UserVerifyAccountModule {}
