import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusIcon } from '@heroicons/react/24/outline';
import { List, Task } from '../../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  list: List;
  onAddTask: (listId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onImproveDescription: (taskId: string) => void;
  onGetAISuggestions: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  list,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onImproveDescription,
  onGetAISuggestions,
}) => {
  const { setNodeRef } = useDroppable({
    id: list._id,
  });

  return (
    <div className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{list.title}</h3>
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
          {list.tasks?.length || 0}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[200px]"
      >
        <SortableContext
          items={list.tasks?.map(task => task._id) || []}
          strategy={verticalListSortingStrategy}
        >
          {list.tasks?.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onImproveDescription={onImproveDescription}
              onGetAISuggestions={onGetAISuggestions}
            />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={() => onAddTask(list._id)}
        className="w-full mt-4 flex items-center justify-center space-x-2 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors duration-200"
      >
        <PlusIcon className="h-4 w-4" />
        <span>Adicionar tarefa</span>
      </button>
    </div>
  );
};

export default TaskList;