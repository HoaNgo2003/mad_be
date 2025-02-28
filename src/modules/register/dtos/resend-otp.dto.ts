import { OmitType } from '@nestjs/swagger';
import { VerifyUserDto } from './verify.dto';

export class ResendDto extends OmitType(VerifyUserDto, ['otp'] as const) {}
