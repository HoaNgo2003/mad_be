import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plant } from './entities/plant.entity';
import { PlantService } from './plant.service';
import { PlantController } from './plant.controller';
import { PlantBenefitModule } from '../plant-benefit/plan-benefit.module';
import {
  IsPlantBenefitExistContraints,
  IsPlantExistContraints,
} from 'src/common/validators/plant.validate';
import { PlantCareProcessModule } from '../plant-care-process/plant-care-process.module';
const validateConstraint = [
  IsPlantBenefitExistContraints,
  IsPlantExistContraints,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([Plant]),
    PlantBenefitModule,
    PlantCareProcessModule,
  ],
  exports: [PlantService],
  controllers: [PlantController],
  providers: [PlantService, ...validateConstraint],
})
export class PlantModule {}
