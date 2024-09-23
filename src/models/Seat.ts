import { prop, getModelForClass } from '@typegoose/typegoose';

export class Seat {
  @prop({ required: true })
  public seatNumber!: string;

  @prop({ required: true, enum: ['VIP', 'Regular'] })
  public category!: 'VIP' | 'Regular';

  @prop({
    required: true,
    enum: ['available', 'unavailable', 'inTransaction', 'booked'],
  })
  public status!: 'available' | 'unavailable' | 'inTransaction' | 'booked';

  @prop({ required: true })
  public season!: string;

  @prop({ required: true })
  public price!: number;
}

export const SeatModel = getModelForClass(Seat);
