import { PartialType } from '@nestjs/swagger';
import { CreateScheduleRuleDto } from './create-schedule-rule.dto';

export class UpdateScheduleRuleDto extends PartialType(CreateScheduleRuleDto) {
  user_plant_id?: never;
}