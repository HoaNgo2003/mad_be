import { Controller } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  constructor(private readonly eventEmitter: EventEmitter2) {}
}
