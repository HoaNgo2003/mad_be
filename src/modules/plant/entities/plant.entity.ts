import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { PlantBenefit } from 'src/modules/plant-benefit/entities/plant-benefit.entity';
import { PlantCareProcess } from 'src/modules/plant-care-process/entities/plant-care-process.entity';
import { PlantWishList } from 'src/modules/plant-wishlist/entities/plant-wishlist.entity';
import { Entity, Column, OneToMany, OneToOne } from 'typeorm';
@Entity()
export class Plant extends BaseMySqlEntity {
  @Column()
  description: string;

  @Column()
  name: string;

  @Column()
  plant_url: string;

  @OneToMany(() => PlantBenefit, (benefit) => benefit.plant, {
    cascade: true,
  })
  plant_benefits: PlantBenefit[];

  @OneToMany(() => PlantCareProcess, (process) => process.plant, {
    cascade: true,
  })
  plant_processes: PlantCareProcess[];

  @OneToOne(() => PlantWishList, (wishlist) => wishlist.plant)
  plant_wishlist: PlantWishList;
}
