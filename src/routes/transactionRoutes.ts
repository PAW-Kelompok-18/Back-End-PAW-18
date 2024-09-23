// src/routes/transactionRoutes.ts

import { Router } from 'express';
import {
  createTransaction,
  getUserTransactions,
} from '../controllers/TransactionController';
import { protectUser } from '../middlewares/protectUser';

const router = Router();

// POST /transactions
router.post('/', protectUser, createTransaction);

// GET /transactions
router.get('/', protectUser, getUserTransactions);

export default router;
