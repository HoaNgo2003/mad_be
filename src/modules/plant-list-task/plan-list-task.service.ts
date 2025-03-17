import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantListTask } from './entities/plan-list-task.entity';

@Injectable()
export class PlantListTaskService extends BaseMySqlService<PlantListTask> {
  constructor(
    @InjectRepository(PlantListTask)
    private readonly repo: Repository<PlantListTask>,
  ) {
    super(repo);
  }
}
