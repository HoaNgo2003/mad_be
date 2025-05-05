import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from './entities/search-history.entity/search-history.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepo: Repository<SearchHistory>,
  ) {}

  /**
   * Lưu lịch sử tìm kiếm
   * Nếu đã tồn tại keyword của user, tăng số lần tìm kiếm
   * Nếu chưa tồn tại, tạo mới bản ghi
   * @description Phương thức này được gọi trong hai trường hợp chính:
   * 1. Khi tìm kiếm bằng text
   * 2. Khi nhận dạng
   * @param user Người dùng thực hiện tìm kiếm
   * @param keyword Từ khóa tìm kiếm
   */
  async createSearchHistory(user: User, keyword: string) {
    // Tìm bản ghi đã tồn tại
    const existingSearchHistory = await this.searchHistoryRepo.findOne({
      where: {
        user: { id: user.id },
        keyword: keyword,
      },
    });

    if (existingSearchHistory) {
      // Nếu đã tồn tại, tăng số lần tìm kiếm
      existingSearchHistory.search_count += 1;
      return this.searchHistoryRepo.save(existingSearchHistory);
    }

    // Nếu chưa tồn tại, tạo mới
    const newSearchHistory = this.searchHistoryRepo.create({
      keyword,
      user,
      search_count: 1,
    });

    return this.searchHistoryRepo.save(newSearchHistory);
  }
}
