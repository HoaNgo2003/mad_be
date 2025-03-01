import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.getOne({
      filter: [
        {
          field: 'email',
          operator: 'eq',
          value: email,
        },
      ],
    });
    if (!user.status) {
      return null;
    }
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    console.log(isPasswordMatching);
    if (!isPasswordMatching) {
      return null;
    }
    console.log(user);

    delete user.password;
    return user;
  }
}
