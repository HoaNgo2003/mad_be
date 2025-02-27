import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';

@Injectable()
export class UsersService extends BaseMySqlService<User> {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {
    super(repo);
  }
}
