import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  RectangleStackIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Board } from '../../types';
import { format } from 'date-fns';

interface BoardCardProps {
  board: Board;
}

const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  const totalTasks = board.lists.reduce((total, list) => total + (list.tasks?.length || 0), 0);
  const completedTasks = board.lists.reduce(
    (total, list) => total + (list.tasks?.filter(task => task.status === 'done').length || 0), 
    0
  );

  return (
    <Link
      to={`/board/${board._id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{board.title}</h3>
          {board.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{board.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <RectangleStackIcon className="h-4 w-4" />
            <span>{board.lists.length} listas</span>
          </div>
          <div className="flex items-center space-x-1">
            <UsersIcon className="h-4 w-4" />
            <span>{board.members.length} membros</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <CalendarIcon className="h-4 w-4" />
                     <span>{format(new Date(board.updatedAt), 'dd/MM')}</span>
        </div>
      </div>

      {totalTasks > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progresso</span>
            <span className="font-medium">
              {completedTasks}/{totalTasks} tarefas
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center mt-4 -space-x-1">
        {board.members.slice(0, 4).map((member) => (
          <div
            key={member._id}
            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-500 text-white text-sm font-medium border-2 border-white"
            title={member.name}
          >
            {member.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {board.members.length > 4 && (
          <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white text-sm font-medium border-2 border-white">
            +{board.members.length - 4}
          </div>
        )}
      </div>
    </Link>
  );
};

export default BoardCard;