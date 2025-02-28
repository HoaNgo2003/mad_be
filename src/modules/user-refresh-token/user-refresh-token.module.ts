import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRefreshToken } from './entities/user-refresh-token.entity';
import { UserRefreshTokenService } from './user-refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRefreshToken])],
  exports: [UserRefreshTokenService],
  controllers: [],
  providers: [UserRefreshTokenService],
})
export class UserRefreshTokenModule {}
