import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserPlantDto {
    @ApiProperty({ example: 1, description: 'ID của người dùng' })
    @IsString()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({ example: 2, description: 'ID của cây trồng' })
    @IsString()
    @IsNotEmpty()
    plant_id: string;

    @ApiProperty({ example: 'Cây đặt ở ban công', required: false })
    @IsString()
    @IsOptional()
    note?: string;
}
