import { Response } from 'express';
import { Board } from '../models/Board';
import { List } from '../models/List';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id;

    const board = new Board({
      title,
      description,
      owner: userId,
      members: [userId],
    });

    await board.save();

    // Create default lists
    const defaultLists = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Review', position: 2 },
      { title: 'Done', position: 3 },
    ];

    const createdLists = [];
    for (const listData of defaultLists) {
      const list = new List({
        title: listData.title,
        board: board._id,
        position: listData.position,
      });
      await list.save();
      createdLists.push(list._id);
    }

    // Update board with list references
    board.lists = createdLists;
    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('lists');

    res.status(201).json({
      message: 'Board created successfully',
      board: populatedBoard,
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const boards = await Board.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('lists')
      .sort({ updatedAt: -1 });

    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const board = await Board.findById(id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate({
        path: 'lists',
        populate: {
          path: 'tasks',
          populate: [
            { path: 'assignedTo', select: 'name email avatar' },
            { path: 'labels' },
          ],
        },
      });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (!board.owner.equals(userId) && !board.members.includes(userId)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ board });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id;

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (!board.owner.equals(userId)) {
      res.status(403).json({ error: 'Only board owner can update board' });
      return;
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate('lists');

    res.json({
      message: 'Board updated successfully',
      board: updatedBoard,
    });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (!board.owner.equals(userId)) {
      res.status(403).json({ error: 'Only board owner can delete board' });
      return;
    }

    // Delete all tasks in the board
    await Task.deleteMany({ board: id });

    // Delete all lists in the board
    await List.deleteMany({ board: id });

    // Delete the board
    await Board.findByIdAndDelete(id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user._id;

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (!board.owner.equals(userId)) {
      res.status(403).json({ error: 'Only board owner can add members' });
      return;
    }

    // Find user by email
    const { User } = await import('../models/User');
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user is already a member
    if (board.members.includes(userToAdd._id)) {
      res.status(400).json({ error: 'User is already a member' });
      return;
    }

    // Add member
    board.members.push(userToAdd._id);
    await board.save();

    const updatedBoard = await Board.findById(id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({
      message: 'Member added successfully',
      board: updatedBoard,
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};