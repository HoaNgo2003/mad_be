import { Module } from '@nestjs/common';
import { PlantIdentifyController } from './plant-identify.controller';
import { PlantIdentifyService } from './plant-identify.service';
import { PlantModule } from '../plant/plant.module';

@Module({
  imports: [PlantModule],
  controllers: [PlantIdentifyController],
  providers: [PlantIdentifyService],
})
export class PlantIdentifyModule {}
