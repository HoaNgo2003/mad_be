import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SearchHistoryService } from './search-history.service';
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { IdentificationResultDto } from './dtos/identification-result-dto';
import { User } from '../user/entities/user.entity';
import { PlantSearchHistoryService } from '../plant-search-history/plant-search-history.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Plant } from '../plant/entities/plant.entity';
import { Repository } from 'typeorm';

@Controller('search-history')
export class SearchHistoryController {
    constructor(
        @InjectRepository(Plant)
        private readonly plantRepo: Repository<Plant>,
        private readonly searchHistoryService: SearchHistoryService,
        private readonly plantSearchHistoryService: PlantSearchHistoryService
    ) { }

    @ApiBearerAuth()
    @Post('/plant-identification-result')
    @ApiOperation({ summary: 'Lưu lịch sử tìm kiếm từ kết quả nhận dạng cây' })
    async saveIdentificationResult(
        @CurrentUser() user: User,
        @Body() dto: IdentificationResultDto
    ) {
        try {
            // Lưu lịch sử tìm kiếm (keyword)
            const searchHistory = await this.searchHistoryService.createSearchHistory(
                user,
                dto.keyword
            );

            // Nếu có plantId, lưu thêm lịch sử tìm kiếm cây
            // Lấy thông tin cây 
            const plant = await this.plantRepo.findOne({
                where: { id: dto.plantId }
            });
            
            if (plant && user) {
                await this.plantSearchHistoryService.createPlantSearchHistory(
                    user?.id || null,
                    {
                        keyword: 'Chi tiết cây',
                        plant_google_name: plant.name,
                        plantId: plant.id,
                        plant_url: plant.plant_url
                    }
                );
    
            };

            return {
                message: 'Thành công'
            }
        } catch (error) {
            console.error('Lỗi khi lưu kết quả:', error);
            throw new BadRequestException('Không thể lưu kết quả');
        }
    }
}
