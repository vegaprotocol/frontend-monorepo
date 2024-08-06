import { EventEmitter } from 'eventemitter3';

type SettableFields = Partial<{ size: string; price: string }>;

class TicketEventEmitter extends EventEmitter {
  event = 'update';

  constructor() {
    super();
  }

  update(values: SettableFields) {
    this.emit(this.event, values);
  }

  listen(callback: (values: SettableFields) => void) {
    this.on(this.event, callback);
  }

  unlisten() {
    this.off(this.event);
  }
}

export const ticketEventEmitter = new TicketEventEmitter();
