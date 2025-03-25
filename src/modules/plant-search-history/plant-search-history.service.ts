import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantSearchHistory } from './entities/plant-search-history.entity';

@Injectable()
export class PlantSearchHistoryService extends BaseMySqlService<PlantSearchHistory> {
  constructor(
    @InjectRepository(PlantSearchHistory)
    private readonly repo: Repository<PlantSearchHistory>,
  ) {
    super(repo);
  }
}
