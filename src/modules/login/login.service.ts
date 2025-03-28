import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import {
  ForgotPasswordDto,
  LoginUserDto,
  VerifyOTPDto,
} from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { ErrorMessage } from 'src/common/error-message';
import * as crypto from 'crypto';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRefreshTokenService } from '../user-refresh-token/user-refresh-token.service';
import { UserRefreshToken } from '../user-refresh-token/entities/user-refresh-token.entity';
import { instanceToPlain } from 'class-transformer';
import { UserVerifyAccountService } from '../user-verify-account/user-verify-account.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LoginService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userRefreshTokenService: UserRefreshTokenService,
    private readonly userVerifyAccountService: UserVerifyAccountService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  createAccessToken(data: Partial<User>): string {
    const expiresIn = process.env.EXPIRESIN;
    const secretOrKey = process.env.SECRETKEY;
    const payload = instanceToPlain(data);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
      secret: secretOrKey,
    });

    return accessToken;
  }

  generateRefreshToken(data: string): string {
    const randomPart = crypto.randomBytes(32).toString('hex'); // 64-character random hex string
    const hash = crypto
      .createHash('sha256')
      .update(data + randomPart)
      .digest('hex'); // Hash input data + random part
    return hash;
  }

  async login(dto: LoginUserDto) {
    const user = await this.userService.getOne({
      filter: [
        {
          field: 'email',
          operator: 'eq',
          value: dto.email,
        },
      ],
    });
    if (!user.status) {
      throw new BadRequestException(ErrorMessage.User.accountNotActive);
    }
    const isPasswordMatching = await bcrypt.compare(
      dto.password,
      user?.password,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException(ErrorMessage.User.passwordNotMatch);
    }
    delete user.password;

    const updateUserData = await this.userService.updateOne(
      {
        filter: [{ field: 'id', operator: 'eq', value: user.id }],
      },
      {
        token_device: dto.token_device,
      },
    );
    const accessToken = this.createAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.email);
    const refreshTokenExpiresIn = parseInt(
      process.env.REFRESH_TOKEN_EXPIRESIN,
      10,
    );
    const data: Partial<UserRefreshToken> = {
      user: updateUserData,
      token: refreshToken,
      expired_at: new Date(
        Date.now() + refreshTokenExpiresIn * 1000 * 60 * 60 * 24,
      ),
      is_used: false,
      email: user.email,
    };
    try {
      await this.userRefreshTokenService.createOne(data);
    } catch (e) {
      Logger.error(e);
      throw new BadRequestException(ErrorMessage.User.failedCreateRefreshToken);
    }
    return { user: updateUserData, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const userRefreshToken = await this.userRefreshTokenService.getOne({
      filter: [
        {
          field: 'token',
          operator: 'eq',
          value: refreshToken,
        },
        {
          field: 'is_used',
          operator: 'eq',
          value: false,
        },
      ],
    });
    if (!userRefreshToken) {
      throw new BadRequestException(ErrorMessage.User.refershTokenInvalid);
    }
    const user = await this.userService.getOne({
      filter: [
        {
          field: 'email',
          operator: 'eq',
          value: userRefreshToken.email,
        },
      ],
    });
    delete user.password;
    const accessToken = this.createAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user.email);
    const refreshTokenExpiresIn = parseInt(
      process.env.REFRESH_TOKEN_EXPIRESIN,
      10,
    );
    userRefreshToken.is_used = true;
    userRefreshToken.save();
    const data: Partial<UserRefreshToken> = {
      user,
      email: user.email,
      token: newRefreshToken,
      expired_at: new Date(
        Date.now() + refreshTokenExpiresIn * 1000 * 60 * 60 * 24,
      ),
      is_used: false,
    };
    try {
      await this.userRefreshTokenService.createOne(data);
    } catch (e) {
      Logger.error(e);
      throw new BadRequestException(ErrorMessage.User.failedCreateRefreshToken);
    }
    return { user, accessToken, refreshToken: newRefreshToken };
  }

  async logout(id: string) {
    const userRefreshToken =
      await this.userRefreshTokenService.getUserTokens(id);
    if (!userRefreshToken) {
      throw new BadRequestException(ErrorMessage.User.refershTokenInvalid);
    }
    userRefreshToken.is_used = true;
    await this.userService.updateOne(
      {
        filter: [
          {
            field: 'id',
            operator: 'eq',
            value: id,
          },
        ],
      },
      {
        token_device: null,
      },
    );
    userRefreshToken.save();
    return true;
  }

  async verifyOTP(otp: string): Promise<boolean> {
    const verifyAccount = await this.userVerifyAccountService.getOne({
      filter: [
        { field: 'otp', operator: 'eq', value: otp },
        { field: 'is_used', operator: 'eq', value: false },
        { field: 'expired_at', operator: 'gte', value: new Date() },
      ],
    });
    if (!verifyAccount) {
      throw new BadRequestException(ErrorMessage.User.optInvalid);
    }

    return true;
  }

  async changePassword(dto: ForgotPasswordDto): Promise<{
    message: string;
  }> {
    const { otp } = dto;
    const isOTPValid = await this.verifyOTP(dto.otp);
    if (!isOTPValid) {
      throw new BadRequestException(ErrorMessage.User.optInvalid);
    }
    const verifyOTP = await this.userVerifyAccountService.getOne({
      filter: [
        { field: 'email', operator: 'eq', value: dto.email },
        { field: 'otp', operator: 'eq', value: otp },
        { field: 'is_used', operator: 'eq', value: false },
        { field: 'expired_at', operator: 'gte', value: new Date() },
      ],
    });
    try {
      await this.userVerifyAccountService.updateOne(
        { filter: [{ field: 'id', operator: 'eq', value: verifyOTP.id }] },
        { is_used: true },
      );
      await this.userService.updateOne(
        {
          filter: [
            {
              field: 'email',
              operator: 'eq',
              value: dto.email,
            },
          ],
        },
        {
          password: dto.password,
        },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
    return {
      message: 'Change password success, login to continue!',
    };
  }
}
