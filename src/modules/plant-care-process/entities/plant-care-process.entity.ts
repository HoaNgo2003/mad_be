import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { ESchedule } from 'src/common/types/data-type';
import { PlantListTask } from 'src/modules/plant-list-task/entities/plan-list-task.entity';

import { Plant } from 'src/modules/plant/entities/plant.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
@Entity()
export class PlantCareProcess extends BaseMySqlEntity {
  @Column({
    type: 'enum',
    enum: ESchedule,
  })
  type: ESchedule;

  @ManyToOne(() => Plant, (plant) => plant.plant_processes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plant_care_id' })
  plant: Plant;

  @OneToMany(() => PlantListTask, (list) => list.process, {
    cascade: true,
    eager: true,
  })
  list_tasks: PlantListTask[];
}
