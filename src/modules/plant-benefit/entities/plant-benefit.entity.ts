import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';

import { Plant } from 'src/modules/plant/entities/plant.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
@Entity()
export class PlantBenefit extends BaseMySqlEntity {
  @Column()
  title: string;

  @Column('json')
  items: string[];

  @ManyToOne(() => Plant, (plant) => plant.plant_benefits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;
}
