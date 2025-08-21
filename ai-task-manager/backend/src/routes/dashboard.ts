import { Router } from 'express';
import { getDashboardMetrics, getTaskAnalytics } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/metrics', getDashboardMetrics);
router.get('/analytics', getTaskAnalytics);

export default router;