import { Response } from 'express';
import { Task } from '../models/Task';
import { List } from '../models/List';
import { Board } from '../models/Board';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, list: listId, priority, dueDate, estimatedHours } = req.body;
    const userId = req.user._id;

    // Verify list exists and user has access
    const list = await List.findById(listId).populate('board');
    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    const board = await Board.findById(list.board);
    if (!board || (!board.owner.equals(userId) && !board.members.includes(userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get position for new task
    const taskCount = await Task.countDocuments({ list: listId });

    // Create task
    const task = new Task({
      title,
      description,
      list: listId,
      board: list.board,
      priority,
      dueDate,
      estimatedHours,
      position: taskCount,
    });

    // Get AI suggestions
    try {
      const aiAnalysis = await aiService.analyzeTask(title, description);
      task.aiSuggestions = {
        suggestedPriority: aiAnalysis.suggestedPriority,
        suggestedDueDate: aiAnalysis.suggestedDueDate,
        estimatedComplexity: aiAnalysis.complexityScore,
      };

      // If no priority was set, use AI suggestion
      if (!priority) {
        task.priority = aiAnalysis.suggestedPriority;
      }

      // If no due date was set, use AI suggestion
      if (!dueDate) {
        task.dueDate = aiAnalysis.suggestedDueDate;
      }
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue without AI suggestions
    }

    await task.save();

    // Add task to list
    await List.findByIdAndUpdate(listId, {
      $push: { tasks: task._id },
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('labels');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId, listId, status, priority, search, page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    let query: any = {};

    // Filter by board if specified
    if (boardId) {
      const board = await Board.findById(boardId);
      if (!board || (!board.owner.equals(userId) && !board.members.includes(userId))) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      query.board = boardId;
    } else {
      // Get all boards user has access to
      const userBoards = await Board.find({
        $or: [{ owner: userId }, { members: userId }],
      }).select('_id');
      query.board = { $in: userBoards.map(b => b._id) };
    }

    // Additional filters
    if (listId) query.list = listId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$text = { $search: search as string };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('labels')
      .populate('list', 'title')
      .sort({ position: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    // Find task and verify access
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const board = await Board.findById(task.board);
    if (!board || (!board.owner.equals(userId) && !board.members.includes(userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Handle list change (moving task between lists)
    if (updates.list && updates.list !== task.list.toString()) {
      const newList = await List.findById(updates.list);
      if (!newList || !newList.board.equals(task.board)) {
        res.status(400).json({ error: 'Invalid list for this board' });
        return;
      }

      // Remove from old list
      await List.findByIdAndUpdate(task.list, {
        $pull: { tasks: task._id },
      });

      // Add to new list
      await List.findByIdAndUpdate(updates.list, {
        $push: { tasks: task._id },
      });

      // Update position in new list
      const taskCount = await Task.countDocuments({ list: updates.list });
      updates.position = taskCount - 1;
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email avatar')
      .populate('labels');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find task and verify access
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const board = await Board.findById(task.board);
    if (!board || (!board.owner.equals(userId) && !board.members.includes(userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Remove from list
    await List.findByIdAndUpdate(task.list, {
      $pull: { tasks: task._id },
    });

    // Delete task
    await Task.findByIdAndDelete(id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const improveTaskDescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { targetLength = 'concise' } = req.body;
    const userId = req.user._id;

    // Find task and verify access
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const board = await Board.findById(task.board);
    if (!board || (!board.owner.equals(userId) && !board.members.includes(userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get improved description from AI
    const improvedDescription = await aiService.improveTaskDescription(
      task.title,
      task.description,
      targetLength
    );

    // Update task with improved description
    task.aiSuggestions = {
      ...task.aiSuggestions,
      improvedDescription,
    };

    await task.save();

    res.json({
      message: 'Task description improved',
      improvedDescription,
      task,
    });
  } catch (error) {
    console.error('Improve task description error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAISuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find task and verify access
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const board = await Board.findById(task.board);
    if (!board || (!board.owner.equals(userId) && !board.members.includes(userId))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Get fresh AI analysis
    const aiAnalysis = await aiService.analyzeTask(task.title, task.description);

    // Update task with new suggestions
    task.aiSuggestions = {
      suggestedPriority: aiAnalysis.suggestedPriority,
      suggestedDueDate: aiAnalysis.suggestedDueDate,
      estimatedComplexity: aiAnalysis.complexityScore,
    };

    await task.save();

    res.json({
      suggestions: task.aiSuggestions,
      analysis: aiAnalysis,
    });
  } catch (error) {
    console.error('Get AI suggestions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};