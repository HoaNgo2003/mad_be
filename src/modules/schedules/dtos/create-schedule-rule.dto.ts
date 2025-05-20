import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Matches } from 'class-validator';

export class CreateScheduleRuleDto {
  @ApiProperty({
    example: '1',
    description: 'ID của bản ghi user-plant (liên kết user và plant)',
  })
  @IsString()
  @IsNotEmpty()
  user_plant_id: string;

  @ApiProperty({ example: 'Tưới nước', description: 'Tên công việc' })
  @IsString()
  @IsNotEmpty()
  task_name: string;

  @ApiProperty({ example: 3, description: 'Bao nhiêu ngày một lần (repeat_interval)' })
  @IsNumber()
  @Min(1, { message: 'repeat_interval phải lớn hơn 0' })
  @IsNotEmpty()
  repeat_interval: number;

  @ApiProperty({ example: '08:00:00', description: 'Giờ thực hiện công việc (HH:mm hoặc HH:mm:ss)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'Giờ thực hiện công việc chưa được nhập',
  })
  time_of_day: string;

  @ApiProperty({ example: 'Tưới cây định kỳ vào sáng sớm', description: 'Ghi chú (không bắt buộc)', required: false })
  @IsString()
  notes?: string;
}