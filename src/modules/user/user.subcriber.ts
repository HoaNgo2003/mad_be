import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    const user = event.entity;
    if (user.password) {
      user.password = await bcrypt.hash(
        user.password,
        parseInt(process.env.SALTORROUNDS),
      );
    }
    if (user.status === undefined) {
      user.status = false;
    }
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    if (!event.entity || !event.databaseEntity) return;

    const user = event.entity;
    const oldUser = event.databaseEntity; // Get the existing DB record

    if (user.password && user.password !== oldUser.password) {
      user.password = await bcrypt.hash(
        user.password,
        parseInt(process.env.SALTORROUNDS),
      );
    }
  }
}
