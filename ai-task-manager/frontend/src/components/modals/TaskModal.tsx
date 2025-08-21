import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Task } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface TaskModalProps {
  task?: Task | null;
  listId: string;
  boardId: string;
  onClose: () => void;
  onSave: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  task,
  listId,
  boardId,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in-progress' | 'review' | 'done',
    dueDate: '',
    estimatedHours: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAIImprovement, setShowAIImprovement] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours?.toString() || '',
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const taskData = {
        ...formData,
        list: listId,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      };

      if (task) {
        await apiService.updateTask(task._id, taskData);
        toast.success('Tarefa atualizada com sucesso');
      } else {
        await apiService.createTask(taskData);
        toast.success('Tarefa criada com sucesso');
      }

      onSave();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao salvar tarefa';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveDescription = async () => {
    if (!task) return;
    
    try {
      setShowAIImprovement(true);
      const { improvedDescription } = await apiService.improveTaskDescription(task._id);
      setFormData(prev => ({
        ...prev,
        description: improvedDescription,
      }));
      toast.success('Descrição melhorada pela IA');
    } catch (error) {
      toast.error('Erro ao melhorar descrição');
    } finally {
      setShowAIImprovement(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input-field"
              value={formData.title}
              onChange={handleChange}
              placeholder="Digite o título da tarefa"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              {task && (
                <button
                  type="button"
                  onClick={handleImproveDescription}
                  disabled={showAIImprovement}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-xs transition-colors"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>{showAIImprovement ? 'Melhorando...' : 'Melhorar com IA'}</span>
                </button>
              )}
            </div>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="input-field resize-none"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva a tarefa detalhadamente"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                id="priority"
                name="priority"
                className="input-field"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="input-field"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="todo">A Fazer</option>
                <option value="in-progress">Em Progresso</option>
                <option value="review">Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Vencimento
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                className="input-field"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
                Horas Estimadas
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                min="0"
                step="0.5"
                className="input-field"
                value={formData.estimatedHours}
                onChange={handleChange}
                placeholder="Ex: 2.5"
              />
            </div>
          </div>

          {task?.aiSuggestions && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                <h4 className="text-sm font-medium text-purple-900">Sugestões de IA</h4>
              </div>
              <div className="text-sm text-purple-800 space-y-1">
                {task.aiSuggestions.suggestedPriority && (
                  <p>Prioridade sugerida: <span className="font-medium">{task.aiSuggestions.suggestedPriority}</span></p>
                )}
                {task.aiSuggestions.suggestedDueDate && (
                  <p>Data sugerida: <span className="font-medium">
                    {new Date(task.aiSuggestions.suggestedDueDate).toLocaleDateString('pt-BR')}
                  </span></p>
                )}
                {task.aiSuggestions.estimatedComplexity && (
                  <p>Complexidade estimada: <span className="font-medium">{task.aiSuggestions.estimatedComplexity}/10</span></p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Salvando...' : (task ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;