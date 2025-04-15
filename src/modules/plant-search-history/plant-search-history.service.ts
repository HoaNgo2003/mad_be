import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantSearchHistory } from './entities/plant-search-history.entity';

@Injectable()
export class PlantSearchHistoryService extends BaseMySqlService<PlantSearchHistory> {
  constructor(
    @InjectRepository(PlantSearchHistory)
    private readonly repo: Repository<PlantSearchHistory>,
  ) {
    super(repo);
  }

  /**
    * Lưu lịch sử tìm kiếm/nhận dạng cây
    * 
    * @description Phương thức này được gọi trong hai trường hợp chính:
    * 1. Khi xem chi tiết cây: Lưu thông tin cây đã được chọn
    * 2. Khi nhận dạng cây bằng hình ảnh: Lưu kết quả nhận dạng
    */
  async createPlantSearchHistory(
    userId: string, 
    searchData: {
      keyword: string,
      plant_google_name?: string,
      plant_url?: string,
      plantId?: string
    }
  ) {
    const newRecord = this.repo.create({
      keyword: searchData.keyword,
      plant_google_name: searchData.plant_google_name,
      plant_url: searchData.plant_url,
      user: { id: userId } as any,
      plant: searchData.plantId ? { id: searchData.plantId } as any : null
    });

    return this.repo.save(newRecord);
  }

}
