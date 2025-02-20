import { InjectRepository } from '@nestjs/typeorm';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

export class UserService extends BaseMySqlService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super(userRepo);
  }
}
