import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantWishList } from './entities/plant-wishlist.entity';
import { PlantModule } from '../plant/plant.module';
import { PlantWishlistService } from './plan-wishlist.service';
import { PlantWishlistController } from './plan-wishlist.controller';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([PlantWishList]), PlantModule],
  exports: [PlantWishlistService],
  controllers: [PlantWishlistController],
  providers: [PlantWishlistService, ...validateConstraint],
})
export class PlantWishlistModule {}
