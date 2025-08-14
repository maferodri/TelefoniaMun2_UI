import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryTypeService } from '../services/inventoryTypeService';

const InventoryTypeForm = ({ item, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    active: item?.active ?? true
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateToken } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting) handleSubmit();
    if (e.key === 'Escape') onCancel();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validateToken()) return;

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    const pattern = /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
    if (!pattern.test(formData.name)) {
      setError('El nombre solo puede contener letras, números, espacios, apóstrofes y guiones');
      return;
    }

    setIsSubmitting(true);
    try {
      setError('');
      let savedItem;
      if (item) {
        savedItem = await inventoryTypeService.update(item.id, formData);
        if (!savedItem) savedItem = { ...item, ...formData };
        onSuccess(savedItem, true);
      } else {
        savedItem = await inventoryTypeService.create(formData);
        if (!savedItem) savedItem = { id: Date.now(), ...formData };
        onSuccess(savedItem, false);
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.message || 'Error al guardar el tipo de inventario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {item ? 'Editar Tipo de Inventario' : 'Nuevo Tipo de Inventario'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Ej: Pantallas, Baterías"
                maxLength="100"
                autoFocus
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Activo
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-300 hover:bg-purple-400 rounded-full disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTypeForm;
