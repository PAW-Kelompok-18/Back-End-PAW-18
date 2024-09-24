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

    // Check Seat Availability
    const seatAvailability = await SeatModel.find({
      _id: { $in: seats },
      status: 'available',
    });

    if (seatAvailability.length !== seats.length) {
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

    // Set a timeout to revert seat status and delete transaction after 10 seconds
    setTimeout(async () => {
      const transactionCheck = await TransactionModel.findById(
        newTransaction._id,
      );
      if (transactionCheck && transactionCheck.status === 'completed') {
        return;
      }
      if (transactionCheck && transactionCheck.status === 'pending') {
        // Change seat status back to 'available'
        await SeatModel.updateMany(
          { _id: { $in: seats } },
          { status: 'available' },
        );
        // Delete the transaction
        await TransactionModel.findByIdAndDelete(newTransaction._id);
      }
    }, 60000); // 60 seconds

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

    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find all pending transactions for the user
    const transactions = await TransactionModel.find({
      userId: user._id,
      status: 'pending',
    });

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: 'No pending transactions found for the user' });
    }

    // Update each transaction
    const updatePromises = transactions.map(async (transaction) => {
      transaction.status = status as 'pending' | 'completed';
      transaction.completedAt = status === 'completed' ? new Date() : undefined;
      await transaction.save();

      // Update seat statuses
      if (status === 'completed') {
        await SeatModel.updateMany(
          { _id: { $in: transaction.seats } },
          { status: 'booked' },
        );
      } else if (status === 'cancelled') {
        await SeatModel.updateMany(
          { _id: { $in: transaction.seats } },
          { status: 'available' },
        );
      }

      return transaction;
    });

    const updatedTransactions = await Promise.all(updatePromises);

    return res.status(200).json({
      message: 'Transactions updated successfully',
      updatedTransactions: updatedTransactions,
    });
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
