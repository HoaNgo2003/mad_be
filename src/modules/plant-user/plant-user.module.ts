import { Module } from '@nestjs/common';
import { UserPlantService } from './plant-user.service';
import { UserPlantController } from './plant-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPlants } from './entities/plant-user.entity';
import { User } from '../user/entities/user.entity';
import { Plant } from '../plant/entities/plant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPlants, User, Plant])],
  providers: [UserPlantService],
  controllers: [UserPlantController]
})
export class PlantUserModule {}
