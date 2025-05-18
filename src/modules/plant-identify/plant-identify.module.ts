import { Module } from '@nestjs/common';
import { PlantIdentifyController } from './plant-identify.controller';
import { PlantIdentifyService } from './plant-identify.service';

@Module({
  controllers: [PlantIdentifyController],
  providers: [PlantIdentifyService],
})
export class PlantIdentifyModule {}
