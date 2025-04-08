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
    if (!plant) {
      throw new Error('Plant not found');
    }
    const existingWishlist = await this.checkPlantInWishList(user, id);
    if (existingWishlist) {
      throw new Error('Plant already in wishlist');
    }
    return this.createOne({
      plant,
      user,
    });
  }

  async checkPlantInWishList(user: User, id: string) {
    const plant = await this.plantService.getOne({
      filter: [
        {
          field: 'id',
          operator: 'eq',
          value: id,
        },
      ],
    });
    const wishlist = await this.repo.findOne({
      where: {
        user: { id: user.id },
        plant: { id: plant.id },
      },
    });
    if (wishlist) {
      return true;
    }
    return false;
  }
}
