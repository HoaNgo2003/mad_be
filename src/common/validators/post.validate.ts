import { Injectable, Logger } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { FindOneByField } from '../types/base-mysql.types';
import { PostsService } from 'src/modules/posts/posts.service';
import { Posts } from 'src/modules/posts/entities/posts.entity';

@Injectable()
@ValidatorConstraint({ name: 'IsPlanExistContraints', async: true })
export class IsPostExistContraints implements ValidatorConstraintInterface {
  constructor(private readonly postsService: PostsService) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    try {
      const { field } = args.constraints[0];
      const options: FindOneByField<Posts> = {
        field,
        value,
      };
      if (args.constraints[0].isDeleted) {
        options.isQueryDeleteRecord = true;
      }
      const isExist = await this.postsService.getOne({
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
