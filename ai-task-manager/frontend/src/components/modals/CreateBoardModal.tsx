import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

interface CreateBoardModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await apiService.createBoard(formData.title, formData.description);
      toast.success('Quadro criado com sucesso');
      onSave();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erro ao criar quadro';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Novo Quadro</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título do Quadro *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input-field"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Projeto Mobile App"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="input-field resize-none"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o objetivo deste quadro"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              {isLoading ? 'Criando...' : 'Criar Quadro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;