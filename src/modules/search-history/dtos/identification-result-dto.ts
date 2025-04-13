import { ApiProperty } from "@dataui/crud/lib/crud";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class IdentificationResultDto {
    @ApiProperty({
      description: 'Từ khóa tìm kiếm(Tên cây được trả về từ Google)',
      example: 'Cây phong'
    })
    @IsString()
    keyword: string;
   
    @ApiProperty({
      description: 'ID của cây (nếu tồn tại trong cơ sở dữ liệu)',
      required: false,
      example: 'id-của-cây'
    })
    @IsOptional()
    @IsString()
    plantId?: string;
   }