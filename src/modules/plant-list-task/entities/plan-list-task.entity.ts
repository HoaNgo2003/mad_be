import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { PlantCareProcess } from 'src/modules/plant-care-process/entities/plant-care-process.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
@Entity()
export class PlantListTask extends BaseMySqlEntity {
  @Column()
  time: string;

  @Column()
  task: string;

  @ManyToOne(() => PlantCareProcess, (process) => process.list_tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plan_care_proccess_id' })
  process: PlantCareProcess;
}
