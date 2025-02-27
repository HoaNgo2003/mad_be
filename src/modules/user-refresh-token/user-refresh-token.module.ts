import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRefreshToken } from './entities/user-refresh-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRefreshToken])],
  exports: [],
  controllers: [],
  providers: [],
})
export class UserRefreshTokenModule {}
