import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  improveTaskDescription,
  getAISuggestions,
} from '../controllers/taskController';
import { validateTask } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/improve-description', improveTaskDescription);
router.get('/:id/ai-suggestions', getAISuggestions);

export default router;