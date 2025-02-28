import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { UsersService } from '../user/user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { ErrorMessage } from 'src/common/error-message';
import { UserVerifyAccount } from '../user-verify-account/entities/user-verify-account.entity';
import { UserVerifyAccountService } from '../user-verify-account/user-verify-account.service';
import { VerifyUserDto } from './dtos/verify.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class RegisterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly userVerifyAccountService: UserVerifyAccountService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  createOTP(): { otp: string; expireAt: Date } {
    const otp = Math.floor(100000 + Math.random() * 900000) + '';
    const expireMinutes = this.configService.get<number>(
      'ACTIVE_ACCOUNT_EXPIRESIN',
    );
    const expireAt = new Date(Date.now() + expireMinutes * 60 * 1000);
    return { otp, expireAt };
  }

  async createUser(data: CreateUserDto): Promise<User> {
    try {
      const user = await this.usersService.createOne(data);
      console.log(user);
      return user;
    } catch (e) {
      Logger.error(e);
      throw new Error('Failed to create user');
    }
  }

  async sendOTP(email: string): Promise<UserVerifyAccount> {
    const user = await this.usersService.getOne({
      filter: [{ field: 'email', operator: 'eq', value: email }],
    });
    if (!user) {
      throw new BadRequestException(ErrorMessage.User.userNotFound);
    }
    const { otp, expireAt } = this.createOTP();
    const data: Partial<UserVerifyAccount> = {
      email,
      otp,
      expired_at: expireAt,
      is_used: false,
      user,
    };
    try {
      return await this.userVerifyAccountService.createOne(data);
    } catch (e) {
      Logger.error(e);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOTP(dto: VerifyUserDto): Promise<{
    message: string;
  }> {
    const { email, otp } = dto;
    const user: User = await this.usersService.getOne({
      filter: [{ field: 'email', operator: 'eq', value: email }],
    });
    if (!user) {
      throw new BadRequestException(ErrorMessage.User.userNotFound);
    }
    if (user.status) {
      throw new BadRequestException(ErrorMessage.User.userAlreadyActive);
    }
    const verifyAccount = await this.userVerifyAccountService.getOne({
      filter: [
        { field: 'email', operator: 'eq', value: email },
        { field: 'otp', operator: 'eq', value: otp },
        { field: 'is_used', operator: 'eq', value: false },
        { field: 'expired_at', operator: 'gte', value: new Date() },
      ],
    });
    if (!verifyAccount) {
      throw new BadRequestException(ErrorMessage.User.optInvalid);
    }
    try {
      await this.userVerifyAccountService.updateOne(
        { filter: [{ field: 'id', operator: 'eq', value: verifyAccount.id }] },
        { is_used: true },
      );
      await this.usersService.updateOne(
        { filter: [{ field: 'id', operator: 'eq', value: user.id }] },
        { status: true },
      );
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException('Failed to verify OTP');
    }
    const data = {
      email: user.email,
      name: user.username,
    };
    console.log(data);
    this.eventEmitter.emit('user.successfully-verified', {
      email: user.email,
      name: data.name,
    });
    return {
      message: 'Verify success! Login to continue',
    };
  }
}
