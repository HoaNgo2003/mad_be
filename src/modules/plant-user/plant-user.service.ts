import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPlants } from './entities/plant-user.entity';
import { CreateUserPlantDto } from './dtos/plant-user.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { Plant } from 'src/modules/plant/entities/plant.entity';

@Injectable()
export class UserPlantService {
  constructor(
    @InjectRepository(UserPlants)
    private readonly repo: Repository<UserPlants>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
  ) {}

  async create(dto: CreateUserPlantDto) {
    const user = await this.userRepo.findOneBy({ id: dto.user_id });
    const plant = await this.plantRepo.findOneBy({ id: dto.plant_id });

    const record = this.repo.create({
      user,
      plant,
      note: dto.note,
    });

    return this.repo.save(record);
  }

  async getPlantsByUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['plant'],
      order: { createdAt: 'DESC' },
    });
  }
}
