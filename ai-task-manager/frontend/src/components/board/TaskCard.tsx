import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  CalendarIcon, 
  ClockIcon, 
  PencilIcon, 
  TrashIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Task } from '../../types';
import { format } from 'date-fns';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onImproveDescription: (taskId: string) => void;
  onGetAISuggestions: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onImproveDescription,
  onGetAISuggestions 
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-danger-500 bg-danger-50';
      case 'high': return 'border-l-warning-500 bg-warning-50';
      case 'medium': return 'border-l-primary-500 bg-primary-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer',
        getPriorityColor(task.priority),
        isDragging && 'opacity-50',
        isOverdue && 'ring-2 ring-danger-200'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {task.title}
        </h3>
        {showActions && (
          <div className="flex space-x-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGetAISuggestions(task._id);
              }}
              className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
              title="Obter sugestões de IA"
            >
              <SparklesIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Editar tarefa"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="p-1 text-danger-600 hover:text-danger-800 transition-colors"
              title="Excluir tarefa"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-3">
          {task.description}
        </p>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label) => (
            <span
              key={label._id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: label.color + '20', 
                color: label.color,
                border: `1px solid ${label.color}40`
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {task.dueDate && (
            <div className={clsx(
              'flex items-center space-x-1',
              isOverdue && 'text-danger-600 font-medium'
            )}>
              <CalendarIcon className="h-3 w-3" />
              <span>
                {format(new Date(task.dueDate), 'dd/MM')}
              </span>
              {isOverdue && <ExclamationTriangleIcon className="h-3 w-3" />}
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <span className={clsx(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
            `priority-${task.priority}`
          )}>
            {task.priority.toUpperCase()}
          </span>
          {task.aiSuggestions && (
            <SparklesIcon className="h-3 w-3 text-purple-500" title="IA ativada" />
          )}
        </div>
      </div>

      {task.assignedTo && task.assignedTo.length > 0 && (
        <div className="flex items-center mt-3 -space-x-1">
          {task.assignedTo.slice(0, 3).map((user) => (
            <div
              key={user._id}
              className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-500 text-white text-xs font-medium border-2 border-white"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {task.assignedTo.length > 3 && (
            <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500 text-white text-xs font-medium border-2 border-white">
              +{task.assignedTo.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;