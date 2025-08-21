import { Response } from 'express';
import { Task } from '../models/Task';
import { Board } from '../models/Board';
import { AuthRequest } from '../middleware/auth';
import { DashboardMetrics } from '../types';

export const getDashboardMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { boardId, timeRange = '30' } = req.query;

    // Get date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(timeRange));

    let boardFilter: any = {};

    if (boardId) {
      // Verify access to specific board
      const board = await Board.findById(boardId);
      if (!board || (!board.owner.equals(userId) && !board.members.includes(userId))) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      boardFilter.board = boardId;
    } else {
      // Get all boards user has access to
      const userBoards = await Board.find({
        $or: [{ owner: userId }, { members: userId }],
      }).select('_id');
      boardFilter.board = { $in: userBoards.map(b => b._id) };
    }

    // Get basic task counts
    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksInProgress,
      tasksByPriority,
      tasksByStatus,
      recentCompletedTasks,
    ] = await Promise.all([
      // Total tasks
      Task.countDocuments(boardFilter),
      
      // Completed tasks
      Task.countDocuments({ ...boardFilter, status: 'done' }),
      
      // Pending tasks (todo + in-progress + review)
      Task.countDocuments({
        ...boardFilter,
        status: { $in: ['todo', 'in-progress', 'review'] },
      }),
      
      // Overdue tasks
      Task.countDocuments({
        ...boardFilter,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' },
      }),
      
      // Tasks in progress
      Task.countDocuments({ ...boardFilter, status: 'in-progress' }),
      
      // Tasks by priority
      Task.aggregate([
        { $match: boardFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      
      // Tasks by status
      Task.aggregate([
        { $match: boardFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      
      // Recently completed tasks for average completion time
      Task.find({
        ...boardFilter,
        status: 'done',
        updatedAt: { $gte: startDate },
      }).select('createdAt updatedAt'),
    ]);

    // Calculate average completion time
    let averageCompletionTime = 0;
    if (recentCompletedTasks.length > 0) {
      const totalCompletionTime = recentCompletedTasks.reduce((sum, task) => {
        const completionTime = task.updatedAt.getTime() - task.createdAt.getTime();
        return sum + completionTime;
      }, 0);
      averageCompletionTime = totalCompletionTime / recentCompletedTasks.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Calculate productivity score (0-100)
    let productivityScore = 0;
    if (totalTasks > 0) {
      const completionRate = (completedTasks / totalTasks) * 100;
      const overdueRate = (overdueTasks / totalTasks) * 100;
      productivityScore = Math.max(0, Math.min(100, completionRate - (overdueRate * 0.5)));
    }

    // Format priority and status data
    const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
    tasksByPriority.forEach((item: any) => {
      if (item._id in priorityMap) {
        priorityMap[item._id as keyof typeof priorityMap] = item.count;
      }
    });

    const statusMap = { todo: 0, 'in-progress': 0, review: 0, done: 0 };
    tasksByStatus.forEach((item: any) => {
      if (item._id in statusMap) {
        statusMap[item._id as keyof typeof statusMap] = item.count;
      }
    });

    const metrics: DashboardMetrics = {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      tasksInProgress,
      averageCompletionTime,
      productivityScore,
      tasksByPriority: priorityMap,
      tasksByStatus: statusMap,
    };

    res.json({ metrics });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { boardId, timeRange = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(timeRange));

    let boardFilter: any = {};
    if (boardId) {
      const board = await Board.findById(boardId);
      if (!board || (!board.owner.equals(userId) && !board.members.includes(userId))) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      boardFilter.board = boardId;
    } else {
      const userBoards = await Board.find({
        $or: [{ owner: userId }, { members: userId }],
      }).select('_id');
      boardFilter.board = { $in: userBoards.map(b => b._id) };
    }

    // Get task completion trends
    const completionTrends = await Task.aggregate([
      {
        $match: {
          ...boardFilter,
          status: 'done',
          updatedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$updatedAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get priority distribution over time
    const priorityTrends = await Task.aggregate([
      {
        $match: {
          ...boardFilter,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            priority: '$priority',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Get most productive time analysis
    const timeAnalysis = await Task.aggregate([
      {
        $match: {
          ...boardFilter,
          status: 'done',
          updatedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $hour: '$updatedAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      completionTrends,
      priorityTrends,
      timeAnalysis,
    });
  } catch (error) {
    console.error('Get task analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};