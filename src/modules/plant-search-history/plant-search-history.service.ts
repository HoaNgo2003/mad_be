import { Injectable } from '@nestjs/common';
import { BaseMySqlService } from 'src/common/services/base-mysql.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantSearchHistory } from './entities/plant-search-history.entity';
import { format } from 'date-fns';
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
      keyword: string;
      plant_google_name?: string;
      plant_url?: string;
      plantId?: string;
    },
  ) {
    const newRecord = this.repo.create({
      keyword: searchData.keyword,
      user: { id: userId } as any,
      plant: +searchData.plantId ? ({ id: +searchData.plantId } as any) : null,
    });

    return this.repo.save(newRecord);
  }

  async getTopKeywordsByUser(userId: string) {
    const now = new Date();

    const results = {
      time: [],
      keyword: [],
      count: [],
    };

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);

      const start = new Date(day);
      start.setHours(0, 0, 0, 0);

      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

      const topKeyword = await this.repo
        .createQueryBuilder('search')
        .select('search.keyword', 'keyword')
        .addSelect('COUNT(*)', 'count')
        .where('search.user = :userId', { userId })
        .andWhere('search.createdAt BETWEEN :start AND :end', { start, end })
        .groupBy('search.keyword')
        .orderBy('count', 'DESC')
        .limit(1)
        .getRawOne();

      results.time.push(format(day, 'dd-MM-yyyy'));

      if (topKeyword) {
        results.keyword.push(topKeyword.keyword);
        results.count.push(Number(topKeyword.count));
      } else {
        results.keyword.push(null); // hoặc '', hoặc 'No data'
        results.count.push(0);
      }
    }

    return results;
  }

  async getRecentSearches(userId: string) {
    const recentSearches = await this.repo
      .createQueryBuilder('plantSearchHistory')
      .leftJoinAndSelect('plantSearchHistory.plant', 'plant') // Join với bảng plant
      .where('plantSearchHistory.user_history = :userId', { userId })
      .andWhere('plantSearchHistory.plant IS NOT NULL') // Chỉ lấy các bản ghi có plant khác NULL
      .orderBy('plantSearchHistory.createdAt', 'DESC') // Sắp xếp theo thời gian tạo
      .getMany();
  
    // Lọc để chỉ lấy nhiều nhất 3 plant với id khác nhau
    const uniquePlants = [];
    const plantIds = new Set();
  
    for (const search of recentSearches) {
      if (search.plant && !plantIds.has(search.plant.id)) {
        uniquePlants.push(search.plant);
        plantIds.add(search.plant.id);
      }
      if (uniquePlants.length >= 3) break; // Dừng khi đã lấy đủ 3 plant
    }
  
    return uniquePlants;
  }
}
