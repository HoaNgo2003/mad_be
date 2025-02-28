import { Injectable, Logger } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';
import { UsersService } from 'src/modules/user/user.service';
import { FindOneByField } from '../types/base-mysql.types';

@Injectable()
@ValidatorConstraint({ name: 'IsUserExistContraints', async: true })
export class IsUserExistContraints implements ValidatorConstraintInterface {
  constructor(private readonly userService: UsersService) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    try {
      const { field } = args.constraints[0];
      const options: FindOneByField<User> = {
        field,
        value,
      };
      if (args.constraints[0].isDeleted) {
        options.isQueryDeleteRecord = true;
      }
      const isExist = await this.userService.getOne({
        filter: [
          {
            field: options.field,
            value: options.value,
            operator: 'eq',
          },
        ],
      });
      return isExist === null;
    } catch (e) {
      Logger.error(e);
      return false;
    }
  }
}

@Injectable()
@ValidatorConstraint({ name: 'IsUserExistContraints', async: true })
export class IsUserNotFoundContraints implements ValidatorConstraintInterface {
  constructor(private readonly userService: UsersService) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    try {
      const { field } = args.constraints[0];
      const options: FindOneByField<User> = {
        field,
        value,
      };
      if (args.constraints[0].isDeleted) {
        options.isQueryDeleteRecord = true;
      }
      const isExist = await this.userService.getOne({
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
