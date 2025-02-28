import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { UserVerifyAccount } from './entities/user-verify-account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class UserVerifyAccountService extends BaseMySqlService<UserVerifyAccount> {
  constructor(
    @InjectRepository(UserVerifyAccount)
    private readonly repo: Repository<UserVerifyAccount>,
  ) {
    super(repo);
  }
}
