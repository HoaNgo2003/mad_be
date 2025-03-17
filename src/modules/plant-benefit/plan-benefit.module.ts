import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantBenefit } from './entities/plant-benefit.entity';
import { PlantBenefitService } from './plan-benefit.service';
import { PlantBenefitController } from './plan-benefit.controller';
const validateConstraint = [];
@Module({
  imports: [TypeOrmModule.forFeature([PlantBenefit])],
  exports: [PlantBenefitService],
  controllers: [PlantBenefitController],
  providers: [PlantBenefitService, ...validateConstraint],
})
export class PlantBenefitModule {}
