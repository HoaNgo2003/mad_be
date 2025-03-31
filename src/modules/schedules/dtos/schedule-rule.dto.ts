import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateScheduleRuleDto {
  @ApiProperty({ example: 1, description: 'ID của người dùng' })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ example: 2, description: 'ID của cây trồng' })
  @IsNumber()
  @IsNotEmpty()
  plant_id: number;

  @ApiProperty({ example: 'Tưới nước', description: 'Tên công việc' })
  @IsString()
  @IsNotEmpty()
  task_name: string;

  @ApiProperty({ example: 3, description: 'Bao nhiêu ngày một lần (repeat_interval)' })
  @IsNumber()
  @Min(1, { message: 'repeat_interval phải lớn hơn 0' })
  @IsNotEmpty()
  repeat_interval: number;

  @ApiProperty({ example: '08:00:00', description: 'Giờ thực hiện công việc (HH:mm:ss)' })
  @IsString()
  @IsNotEmpty()
  time_of_day: string;

  @ApiProperty({ example: 'Tưới cây định kỳ vào sáng sớm', description: 'Ghi chú (không bắt buộc)', required: false })
  @IsString()
  notes?: string;
}
