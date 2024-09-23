import { prop, getModelForClass } from '@typegoose/typegoose';

export class Seat {
  @prop({ required: true, unique: true })
  public seatNumber!: string;

  @prop({ required: true, enum: ['VIP', 'Regular'], default: 'Regular' })
  public category!: 'VIP' | 'Regular';

  @prop({
    required: true,
    enum: ['available', 'unavailable', 'inTransaction', 'booked'],
    default: 'available',
  })
  public status!: 'available' | 'unavailable' | 'inTransaction' | 'booked';

  @prop()
  public season?: string;

  @prop({ required: true })
  public price!: number;
}

export const SeatModel = getModelForClass(Seat);
