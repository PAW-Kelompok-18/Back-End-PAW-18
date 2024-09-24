import express from 'express';
import { SeatController } from '../controllers/seatController';
import { protectUser } from '../middlewares/protectUser';

const router = express.Router();

// Create a new seat
router.post('/', SeatController.createSeat);

// Get all seats
router.get('/', protectUser, SeatController.getAllSeats);

// Get a single seat by ID
router.get('/:seatNumber', SeatController.getSeatByNumber);

// Update a seat
// router.put('/:seatNumber', SeatController.updateSeat);

// Delete a seat
// router.delete('/:seatNumber', SeatController.deleteSeat);

export default router;
