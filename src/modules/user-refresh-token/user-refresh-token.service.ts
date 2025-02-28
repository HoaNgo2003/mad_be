import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { UserRefreshToken } from './entities/user-refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRefreshTokenService extends BaseMySqlService<UserRefreshToken> {
  constructor(
    @InjectRepository(UserRefreshToken)
    private readonly repo: Repository<UserRefreshToken>,
  ) {
    super(repo);
  }
}
