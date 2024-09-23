import express from 'express';
import { SeatController } from '../controllers/seatController';

const router = express.Router();

// Create a new seat
router.post('/', SeatController.createSeat);

// Get all seats
router.get('/', SeatController.getAllSeats);

// Get a single seat by ID
router.get('/:seatNumber', SeatController.getSeatByNumber);

// Update a seat
// router.put('/:seatNumber', SeatController.updateSeat);

// Delete a seat
router.delete('/:seatNumber', SeatController.deleteSeat);

export default router;
