import { Request, Response, NextFunction } from 'express';
import { SeatModel } from '../models/Seat';

export class SeatController {
  // Create a new seat
  static async createSeat(req: Request, res: Response, next: NextFunction) {
    try {
      const allKursi: { [key: string]: number } = {};
      for (let i = 1; i <= 10; i++) {
        for (let j = 1; j <= 6; j++) {
          const seatNumber = String.fromCharCode(64 + j) + i;
          const price = 50000;
          allKursi[seatNumber] = price;
        }
      }
      // const seatNumber: string = req.body.seatNumber;
      // const price: string = req.body.price;
      for (const seatNumber in allKursi) {
        const price = allKursi[seatNumber];
        await SeatModel.create({
          seatNumber: seatNumber,
          price: price,
        });
      }
      res.status(201).json({ message: 'success' });
    } catch (error) {
      next(error);
    }
  }

  // Get all seats
  static async getAllSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const seats = await SeatModel.find();
      res.json(seats);
    } catch (error) {
      next(error);
    }
  }

  // Get a single seat by seatNumber
  static async getSeatByNumber(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const seat = await SeatModel.findOne({
        seatNumber: req.params.seatNumber,
      });
      if (!seat) {
        return res.status(404).json({ message: 'Seat not found' });
      }
      res.json(seat);
    } catch (error) {
      next(error);
    }
  }

  // Update a seat by seatNumber
  static async updateSeat(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedSeat = await SeatModel.findOneAndUpdate(
        { seatNumber: req.params.seatNumber },
        req.body,
        { new: true },
      );
      if (!updatedSeat) {
        return res.status(404).json({ message: 'Seat not found' });
      }
      res.json(updatedSeat);
    } catch (error) {
      next(error);
    }
  }

  // Delete a seat by seatNumber
  static async deleteSeat(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedSeat = await SeatModel.findOneAndDelete({
        seatNumber: req.params.seatNumber,
      });
      if (!deletedSeat) {
        return res.status(404).json({ message: 'Seat not found' });
      }
      res.json({ message: 'Seat deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
