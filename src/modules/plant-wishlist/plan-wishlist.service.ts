import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantWishList } from './entities/plant-wishlist.entity';
import { User } from '../user/entities/user.entity';
import { PlantService } from '../plant/plant.service';

@Injectable()
export class PlantWishlistService extends BaseMySqlService<PlantWishList> {
  constructor(
    @InjectRepository(PlantWishList)
    private readonly repo: Repository<PlantWishList>,
    private readonly plantService: PlantService,
  ) {
    super(repo);
  }

  async addToWishList(user: User, id: string) {
    const plant = await this.plantService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: id,
        },
      ],
    });
    return this.createOne({
      plant,
      user,
    });
  }
}
