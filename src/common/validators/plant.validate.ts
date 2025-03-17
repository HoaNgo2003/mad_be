import { Injectable, Logger } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PlantService } from 'src/modules/plant/plant.service';
import { FindOneByField } from '../types/base-mysql.types';
import { Plant } from 'src/modules/plant/entities/plant.entity';
import { PlantBenefit } from 'src/modules/plant-benefit/entities/plant-benefit.entity';
import { PlantBenefitService } from 'src/modules/plant-benefit/plan-benefit.service';

@Injectable()
@ValidatorConstraint({ name: 'IsPlanExistContraints', async: true })
export class IsPlantExistContraints implements ValidatorConstraintInterface {
  constructor(private readonly plantService: PlantService) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    try {
      const { field } = args.constraints[0];
      const options: FindOneByField<Plant> = {
        field,
        value,
      };
      if (args.constraints[0].isDeleted) {
        options.isQueryDeleteRecord = true;
      }
      const isExist = await this.plantService.getOne({
        filter: [
          {
            field: options.field,
            value: options.value,
            operator: 'eq',
          },
        ],
      });
      return isExist !== null;
    } catch (e) {
      Logger.error(e);
      return false;
    }
  }
}

@Injectable()
@ValidatorConstraint({ name: 'IsPlanBenefitExistContraints', async: true })
export class IsPlantBenefitExistContraints
  implements ValidatorConstraintInterface
{
  constructor(private readonly plantBenefitService: PlantBenefitService) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    try {
      const { field } = args.constraints[0];
      const options: FindOneByField<PlantBenefit> = {
        field,
        value,
      };
      if (args.constraints[0].isDeleted) {
        options.isQueryDeleteRecord = true;
      }
      const isExist = await this.plantBenefitService.getOne({
        filter: [
          {
            field: options.field,
            value: options.value,
            operator: 'eq',
          },
        ],
      });
      return isExist !== null;
    } catch (e) {
      Logger.error(e);
      return false;
    }
  }
}
