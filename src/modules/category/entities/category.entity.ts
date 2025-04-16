import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Plant } from 'src/modules/plant/entities/plant.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('category')
export class Category extends BaseMySqlEntity {
  @Column()
  name: string;

  @OneToMany(() => Plant, (plant) => plant.category)
  plants: Plant[];
}
