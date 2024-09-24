// src/routes/transactionRoutes.ts

import { Router } from 'express';
import {
  createTransaction,
  getUserTransactions,
  updateTransactionStatus,
  deleteTransaction,
} from '../controllers/TransactionController';
import { protectUser } from '../middlewares/protectUser';

const router = Router();

// POST /transactions
router.post('/', protectUser, createTransaction);

// GET /transactions
router.get('/', protectUser, getUserTransactions);

// POST /transactions/:id/confirm
router.patch(
  '/confirm',
  protectUser,
  (req, res, next) => {
    req.body.status = 'completed';
    next();
  },
  updateTransactionStatus,
);

router.delete('/:id', protectUser, deleteTransaction);

export default router;
