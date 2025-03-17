import { Module } from '@nestjs/common';
import { UsersModule } from '../user/user.module';
import { UserRefreshTokenModule } from '../user-refresh-token/user-refresh-token.module';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IsUserNotFoundContraints } from 'src/common/validators/user.validate';
import { RegisterModule } from '../register/register.module';
import { UserVerifyAccountModule } from '../user-verify-account/user-verify-account.module';
const constraint = [IsUserNotFoundContraints];
@Module({
  imports: [
    UsersModule,
    UserRefreshTokenModule,
    RegisterModule,
    UserVerifyAccountModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: () => ({
        secret: process.env.SECRETKEY,
        signOptions: { expiresIn: process.env.EXPIRESIN },
      }),
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, ...constraint],
  exports: [LoginService],
})
export class LoginModule {}
