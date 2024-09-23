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

    @prop({ required: true })
    public qrCode!: string;

    @prop({ required: true, default: Date.now })
    public issuedAt!: Date;
}

export const TicketModel = getModelForClass(Ticket);

