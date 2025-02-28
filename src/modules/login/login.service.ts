import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { LoginUserDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { ErrorMessage } from 'src/common/error-message';
import * as crypto from 'crypto';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRefreshTokenService } from '../user-refresh-token/user-refresh-token.service';
import { UserRefreshToken } from '../user-refresh-token/entities/user-refresh-token.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class LoginService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userRefreshTokenService: UserRefreshTokenService,
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
    console.log(user);
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

    const accessToken = this.createAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.email);
    const refreshTokenExpiresIn = parseInt(
      process.env.REFRESH_TOKEN_EXPIRESIN,
      10,
    );
    const data: Partial<UserRefreshToken> = {
      user,
      token: refreshToken,
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
    return { user, accessToken, refreshToken };
  }
}
