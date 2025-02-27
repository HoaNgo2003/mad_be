// import {
//   EntitySubscriberInterface,
//   EventSubscriber,
//   InsertEvent,
//   UpdateEvent,
// } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { User } from './entities/user.entity';

// @EventSubscriber()
// export class UserSubscriber implements EntitySubscriberInterface<User> {
//   listenTo() {
//     return User;
//   }

//   async beforeInsert(event: InsertEvent<User>) {
//     const user = event.entity;
//     if (user.password) {
//       user.password = await bcrypt.hash(
//         user.password,
//         parseInt(process.env.SALTORROUNDS) || 10,
//       );
//     }

//     if (user.active === undefined) {
//       user.active = false;
//     }
//   }

//   async beforeUpdate(event: UpdateEvent<User>) {
//     const user = event.entity;
//     if (user.password) {
//       user.password = await bcrypt.hash(
//         user.password,
//         parseInt(process.env.SALTORROUNDS) || 10,
//       );
//     }
//   }
// }
