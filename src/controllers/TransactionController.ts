import { Request, Response, NextFunction } from 'express';
import { TransactionModel } from '../models/Transaction';
import { SeatModel } from '../models/Seat';
import { DocumentType } from '@typegoose/typegoose';
import { User } from '../models/User';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

// Create Transaction
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as DocumentType<User>;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { seats } = req.body;

    // Validate data
    if (!seats || seats.length === 0) {
      return res.status(400).json({ message: 'Seats are required' });
    }

    // Chect Seat Availability
    const seatAvailability = await SeatModel.find({
      _id: { $in: seats },
      status: 'available',
    });

    if (seatAvailability.length === 0) {
      return res.status(400).json({ message: 'Some seats are unavailable' });
    }

    // Update status seat to 'inTransaction'
    await SeatModel.updateMany(
      { _id: { $in: seats } },
      { status: 'inTransaction' },
    );

    // Make new transaction
    const newTransaction = new TransactionModel({
      userId: new Types.ObjectId(user._id),
      seats,
      status: 'pending',
      createdAt: new Date(),
    });

    await newTransaction.save();

    return res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Transactions
export const getUserTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as DocumentType<User>;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const transactions = await TransactionModel.find({ userId: user._id })
      .populate('seats')
      .populate('userId');

    return res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

// Get Transaction By Id
export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as DocumentType<User>;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const transaction = await TransactionModel.findById(id)
      .populate('seats')
      .populate('userId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure only the user who created the transaction can access it.
    if (transaction.userId.toString() !== user._id.toString()) {
      return next(createHttpError(403, 'Forbidden access'));
    }

    return res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

// Update Transaction Status
export const updateTransactionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as DocumentType<User>;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure only the user who created the transaction can change it.
    if (transaction.userId.toString() !== user._id.toString()) {
      return next(createHttpError(403, 'Forbidden access'));
    }

    transaction.status = status;
    transaction.completedAt = status === 'completed' ? new Date() : undefined;

    await transaction.save();

    // change status to booked if transaction is completed
    if (status === 'completed') {
      await SeatModel.updateMany(
        { _id: { $in: transaction.seats } },
        { status: 'booked' },
      );
    }

    // If the transaction is cancelled, change the seat status back to 'available'
    if (status === 'cancelled') {
      await SeatModel.updateMany(
        { _id: { $in: transaction.seats } },
        { status: 'available' },
      );
    }

    return res
      .status(200)
      .json({ message: 'Transaction updated successfully', transaction });
  } catch (error) {
    next(error);
  }
};

// Delete transaction
export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as DocumentType<User>;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const transaction = await TransactionModel.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure only the user who created the transaction can delete it.
    if (transaction.userId.toString() !== user._id.toString()) {
      return next(createHttpError(403, 'Forbidden access'));
    }

    await TransactionModel.findByIdAndDelete(id);

    // Change seat status back to 'available'
    await SeatModel.updateMany(
      { _id: { $in: transaction.seats } },
      { status: 'available' },
    );

    return res
      .status(200)
      .json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};
