import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { ErrorMessage } from 'src/common/error-message';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.getOne({
      filter: [
        {
          field: 'username',
          operator: 'eq',
          value: username,
        },
      ],
    });
    if (user && !user.status) {
      throw new BadRequestException(ErrorMessage.User.accountDeactive);
    }
    if (user && user.password === pass) {
      return user;
    }
    return null;
  }
}
