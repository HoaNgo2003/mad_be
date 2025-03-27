import { Injectable, Logger } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { FindOneByField } from '../types/base-mysql.types';
import { Posts } from 'src/modules/posts/entities/posts.entity';
import { PostsLikeService } from 'src/modules/posts-like/posts-like.service';

@Injectable()
@ValidatorConstraint({ name: 'IsPlanExistContraints', async: true })
export class IsPostsLikeExistContraints
  implements ValidatorConstraintInterface
{
  constructor(private readonly postsLikeService: PostsLikeService) {}

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
      const isExist = await this.postsLikeService.getOne({
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
