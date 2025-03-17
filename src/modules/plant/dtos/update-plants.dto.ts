import { PartialType } from '@nestjs/swagger';
import { CreatePlantDto } from './create-plants.dto';

export class UpdatePlantDto extends PartialType(CreatePlantDto) {}
