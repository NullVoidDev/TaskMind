import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Board, DashboardMetrics } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import BoardCard from './BoardCard';
import MetricsCard from './MetricsCard';
import CreateBoardModal from '../modals/CreateBoardModal';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [boardsResponse, metricsResponse] = await Promise.all([
        apiService.getBoards(),
        apiService.getDashboardMetrics(),
      ]);
      
      setBoards(boardsResponse.boards);
      setMetrics(metricsResponse.metrics);
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoardCreated = () => {
    setShowCreateBoard(false);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo de volta, {user?.name}! 👋
        </h1>
        <p className="text-primary-100">
          Gerencie suas tarefas com inteligência artificial para máxima produtividade.
        </p>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Total de Tarefas"
            value={metrics.totalTasks}
            icon={ChartBarIcon}
            color="blue"
          />
          <MetricsCard
            title="Concluídas"
            value={metrics.completedTasks}
            icon={CheckCircleIcon}
            color="green"
            subtitle={`${metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}% do total`}
          />
          <MetricsCard
            title="Em Atraso"
            value={metrics.overdueTasks}
            icon={ExclamationTriangleIcon}
            color="red"
          />
          <MetricsCard
            title="Tempo Médio"
            value={`${Math.round(metrics.averageCompletionTime)}d`}
            icon={ClockIcon}
            color="purple"
            subtitle="para conclusão"
          />
        </div>
      )}

      {/* Productivity Score */}
      {metrics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Score de Produtividade</h2>
            <SparklesIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.productivityScore}%` }}
                ></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {Math.round(metrics.productivityScore)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Baseado na taxa de conclusão e cumprimento de prazos
          </p>
        </div>
      )}

      {/* Boards Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Seus Quadros</h2>
          <button
            onClick={() => setShowCreateBoard(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Novo Quadro</span>
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum quadro encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Crie seu primeiro quadro para começar a organizar suas tarefas.
            </p>
            <button
              onClick={() => setShowCreateBoard(true)}
              className="btn-primary"
            >
              Criar Primeiro Quadro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas por Prioridade</h3>
            <div className="space-y-3">
              {Object.entries(metrics.tasksByPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{priority}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas por Status</h3>
            <div className="space-y-3">
              {Object.entries(metrics.tasksByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {status === 'todo' ? 'A Fazer' : 
                     status === 'in-progress' ? 'Em Progresso' :
                     status === 'review' ? 'Revisão' : 'Concluído'}
                  </span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreateBoard && (
        <CreateBoardModal
          onClose={() => setShowCreateBoard(false)}
          onSave={handleBoardCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;