import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { PlantBenefit } from 'src/modules/plant-benefit/entities/plant-benefit.entity';
import { PlantCareProcess } from 'src/modules/plant-care-process/entities/plant-care-process.entity';
import { PlantSearchHistory } from 'src/modules/plant-search-history/entities/plant-search-history.entity';
import { PlantWishList } from 'src/modules/plant-wishlist/entities/plant-wishlist.entity';
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
@Entity()
export class Plant extends BaseMySqlEntity {
  @Column()
  description: string;

  @Column()
  name: string;

  @Column()
  plant_url: string;

  @Column()
  environment: string;

  @Column()
  usage: string;

  @Column()
  take_care: string;

  @OneToMany(() => PlantBenefit, (benefit) => benefit.plant, {
    cascade: true,
  })
  plant_benefits: PlantBenefit[];

  @OneToMany(() => PlantCareProcess, (process) => process.plant, {
    cascade: true,
  })
  plant_processes: PlantCareProcess[];

  @OneToMany(() => PlantWishList, (wishlist) => wishlist.plant, {
    cascade: true,
  })
  plant_wishlist: PlantWishList[];

  @OneToMany(() => PlantSearchHistory, (searchHistory) => searchHistory.plant, {
    cascade: true,
  })
  plant_search_histories: PlantSearchHistory[];

  @ManyToOne(() => Category, (category) => category.plants, {
    onDelete: 'CASCADE',
  })
  category: Category;
}
