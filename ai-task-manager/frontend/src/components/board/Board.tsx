import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Board as BoardType, Task, List } from '../../types';
import { apiService } from '../../services/api';
import TaskList from './TaskList';
import TaskModal from '../modals/TaskModal';
import AISuggestionsModal from '../modals/AISuggestionsModal';
import toast from 'react-hot-toast';

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestionsTask, setAISuggestionsTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  const loadBoard = async () => {
    if (!boardId) return;
    
    try {
      setLoading(true);
      const { board: boardData } = await apiService.getBoard(boardId);
      setBoard(boardData);
    } catch (error: any) {
      toast.error('Erro ao carregar quadro');
      console.error('Load board error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = findTaskById(active.id as string);
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !board) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find the task being moved
    const task = findTaskById(taskId);
    if (!task) return;

    // Determine if dropping on a list or another task
    const overList = board.lists.find(list => list._id === overId);
    const overTask = findTaskById(overId);
    
    let targetListId = overList?._id || overTask?.list || task.list;
    let newPosition = 0;

    if (overTask && overTask.list === targetListId) {
      // Dropping on another task in the same list
      const targetList = board.lists.find(list => list._id === targetListId);
      if (targetList) {
        const overIndex = targetList.tasks.findIndex(t => t._id === overTask._id);
        newPosition = overIndex;
      }
    } else if (overList) {
      // Dropping on a list
      newPosition = overList.tasks.length;
    }

    // Update task position and list
    try {
      await apiService.updateTask(taskId, {
        list: targetListId,
        position: newPosition,
      });
      
      // Reload board to get updated state
      await loadBoard();
      toast.success('Tarefa movida com sucesso');
    } catch (error) {
      toast.error('Erro ao mover tarefa');
      console.error('Move task error:', error);
    }
  };

  const findTaskById = (id: string): Task | null => {
    if (!board) return null;
    
    for (const list of board.lists) {
      const task = list.tasks.find(task => task._id === id);
      if (task) return task;
    }
    return null;
  };

  const handleAddTask = (listId: string) => {
    setEditingTask(null);
    setShowTaskModal(true);
    // Store the target list ID for new task creation
    (window as any).targetListId = listId;
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      await apiService.deleteTask(taskId);
      await loadBoard();
      toast.success('Tarefa excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir tarefa');
      console.error('Delete task error:', error);
    }
  };

  const handleImproveDescription = async (taskId: string) => {
    try {
      const { improvedDescription } = await apiService.improveTaskDescription(taskId);
      toast.success('Descrição melhorada pela IA');
      await loadBoard();
    } catch (error) {
      toast.error('Erro ao melhorar descrição');
      console.error('Improve description error:', error);
    }
  };

  const handleGetAISuggestions = async (taskId: string) => {
    const task = findTaskById(taskId);
    if (!task) return;

    try {
      setAISuggestionsTask(task);
      setShowAISuggestions(true);
    } catch (error) {
      toast.error('Erro ao obter sugestões de IA');
      console.error('Get AI suggestions error:', error);
    }
  };

  const handleTaskSaved = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    loadBoard();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Quadro não encontrado</h3>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
        {board.description && (
          <p className="text-gray-600 mt-1">{board.description}</p>
        )}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {board.lists.map((list) => (
            <TaskList
              key={list._id}
              list={list}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onImproveDescription={handleImproveDescription}
              onGetAISuggestions={handleGetAISuggestions}
            />
          ))}
        </div>
      </DndContext>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          listId={editingTask?.list || (window as any).targetListId}
          boardId={boardId!}
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskSaved}
        />
      )}

      {showAISuggestions && aiSuggestionsTask && (
        <AISuggestionsModal
          task={aiSuggestionsTask}
          onClose={() => setShowAISuggestions(false)}
          onApplySuggestions={() => {
            setShowAISuggestions(false);
            loadBoard();
          }}
        />
      )}
    </div>
  );
};

export default Board;