import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Task } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface AISuggestionsModalProps {
  task: Task;
  onClose: () => void;
  onApplySuggestions: () => void;
}

const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({
  task,
  onClose,
  onApplySuggestions,
}) => {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadAISuggestions();
  }, [task._id]);

  const loadAISuggestions = async () => {
    try {
      setLoading(true);
      const { suggestions: aiSuggestions, analysis: aiAnalysis } = await apiService.getAISuggestions(task._id);
      setSuggestions(aiSuggestions);
      setAnalysis(aiAnalysis);
    } catch (error) {
      toast.error('Erro ao carregar sugestões de IA');
      console.error('Load AI suggestions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (field: string, value: any) => {
    try {
      setApplying(true);
      const updates: any = {};
      
      switch (field) {
        case 'priority':
          updates.priority = value;
          break;
        case 'dueDate':
          updates.dueDate = value;
          break;
        case 'description':
          updates.description = value;
          break;
        case 'estimatedHours':
          updates.estimatedHours = value;
          break;
      }

      await apiService.updateTask(task._id, updates);
      toast.success('Sugestão aplicada com sucesso');
      onApplySuggestions();
    } catch (error) {
      toast.error('Erro ao aplicar sugestão');
      console.error('Apply suggestion error:', error);
    } finally {
      setApplying(false);
    }
  };

  const applyAllSuggestions = async () => {
    if (!suggestions || !analysis) return;

    try {
      setApplying(true);
      const updates: any = {};

      if (suggestions.suggestedPriority && suggestions.suggestedPriority !== task.priority) {
        updates.priority = suggestions.suggestedPriority;
      }

      if (suggestions.suggestedDueDate && suggestions.suggestedDueDate !== task.dueDate) {
        updates.dueDate = suggestions.suggestedDueDate;
      }

      if (suggestions.improvedDescription && suggestions.improvedDescription !== task.description) {
        updates.description = suggestions.improvedDescription;
      }

      if (analysis.estimatedHours && analysis.estimatedHours !== task.estimatedHours) {
        updates.estimatedHours = analysis.estimatedHours;
      }

      if (Object.keys(updates).length > 0) {
        await apiService.updateTask(task._id, updates);
        toast.success('Todas as sugestões aplicadas');
        onApplySuggestions();
      } else {
        toast.info('Nenhuma mudança necessária');
      }
    } catch (error) {
      toast.error('Erro ao aplicar sugestões');
      console.error('Apply all suggestions error:', error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sugestões de IA</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Analisando tarefa...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Tarefa Atual</h3>
                <p className="text-sm text-gray-600 mb-2"><strong>Título:</strong> {task.title}</p>
                <p className="text-sm text-gray-600 mb-2"><strong>Prioridade:</strong> {task.priority}</p>
                <p className="text-sm text-gray-600 mb-2"><strong>Data de Vencimento:</strong> {
                  task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'Não definida'
                }</p>
                {task.description && (
                  <p className="text-sm text-gray-600"><strong>Descrição:</strong> {task.description}</p>
                )}
              </div>

              {analysis?.reasoning && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Análise da IA</h4>
                  <p className="text-sm text-purple-800">{analysis.reasoning}</p>
                </div>
              )}

              {suggestions && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Sugestões Recomendadas</h3>

                  {suggestions.suggestedPriority && suggestions.suggestedPriority !== task.priority && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Prioridade</p>
                        <p className="text-xs text-blue-700">
                          Atual: {task.priority} → Sugerido: {suggestions.suggestedPriority}
                        </p>
                      </div>
                      <button
                        onClick={() => applySuggestion('priority', suggestions.suggestedPriority)}
                        disabled={applying}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <CheckIcon className="h-3 w-3" />
                        <span>Aplicar</span>
                      </button>
                    </div>
                  )}

                  {suggestions.suggestedDueDate && suggestions.suggestedDueDate !== task.dueDate && (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-900">Data de Vencimento</p>
                        <p className="text-xs text-green-700">
                          Sugerido: {new Date(suggestions.suggestedDueDate).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => applySuggestion('dueDate', suggestions.suggestedDueDate)}
                        disabled={applying}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                      >
                        <CheckIcon className="h-3 w-3" />
                        <span>Aplicar</span>
                      </button>
                    </div>
                  )}

                  {suggestions.improvedDescription && suggestions.improvedDescription !== task.description && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-yellow-900">Descrição Melhorada</p>
                        <button
                          onClick={() => applySuggestion('description', suggestions.improvedDescription)}
                          disabled={applying}
                          className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                        >
                          <CheckIcon className="h-3 w-3" />
                          <span>Aplicar</span>
                        </button>
                      </div>
                      <p className="text-xs text-yellow-700 bg-white p-2 rounded border">
                        {suggestions.improvedDescription}
                      </p>
                    </div>
                  )}

                  {analysis?.estimatedHours && analysis.estimatedHours !== task.estimatedHours && (
                    <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-indigo-900">Horas Estimadas</p>
                        <p className="text-xs text-indigo-700">
                          Sugerido: {analysis.estimatedHours} horas
                        </p>
                      </div>
                      <button
                        onClick={() => applySuggestion('estimatedHours', analysis.estimatedHours)}
                        disabled={applying}
                        className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                      >
                        <CheckIcon className="h-3 w-3" />
                        <span>Aplicar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Fechar
                </button>
                {suggestions && (
                  <button
                    onClick={applyAllSuggestions}
                    disabled={applying}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>{applying ? 'Aplicando...' : 'Aplicar Todas'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISuggestionsModal;