import { BaseMySqlEntity } from "src/common/entities/base-mysql.entity";
import { Plant } from "src/modules/plant/entities/plant.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity('user_plants')
export class UserPlants extends BaseMySqlEntity{

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Plant, { onDelete: 'CASCADE' })
  plant: Plant;
}