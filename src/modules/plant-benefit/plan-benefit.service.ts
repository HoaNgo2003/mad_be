import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantBenefit } from './entities/plant-benefit.entity';

@Injectable()
export class PlantBenefitService extends BaseMySqlService<PlantBenefit> {
  constructor(
    @InjectRepository(PlantBenefit)
    private readonly repo: Repository<PlantBenefit>,
  ) {
    super(repo);
  }
}
