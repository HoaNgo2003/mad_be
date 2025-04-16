import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService extends BaseMySqlService<Category> {
  constructor(
    @InjectRepository(Category) private readonly repo: Repository<Category>,
  ) {
    super(repo);
  }
}
