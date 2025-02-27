import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserVerifyAccount } from './entities/user-verify-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserVerifyAccount])],
  exports: [],
  controllers: [],
  providers: [],
})
export class UserVerifyAccountModule {}
