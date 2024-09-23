import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { Transaction } from './Transaction';
import { Seat } from './Seat';
import { User } from './User';

export class Ticket {
  @prop({ required: true, ref: () => Transaction })
  public transactionId!: Ref<Transaction>;

  @prop({ required: true, ref: () => User })
  public userId!: Ref<User>;

  @prop({ required: true, ref: () => Seat })
  public seatId!: Ref<Seat>;

  @prop()
  public qrCode?: string;
}

export const TicketModel = getModelForClass(Ticket);
