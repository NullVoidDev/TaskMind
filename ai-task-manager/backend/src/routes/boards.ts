import { Router } from 'express';
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  addMember,
} from '../controllers/boardController';
import { validateBoard } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', validateBoard, createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.put('/:id', validateBoard, updateBoard);
router.delete('/:id', deleteBoard);
router.post('/:id/members', addMember);

export default router;