import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';

const InventoryForm = ({ item, inventoryTypes, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    id_inventory_type: item?.id_inventory_type || '',
    name: item?.name || '',
    creation_date: item?.creation_date
      ? new Date(item.creation_date).toISOString().slice(0, 16) // para <input type="datetime-local">
      : new Date().toISOString().slice(0, 16),
    active: item?.active ?? true,
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

    // Validaciones “igual estilo” que CatalogForm
    if (!formData.id_inventory_type.trim()) {
      setError('El tipo de inventario es requerido');
      return;
    }

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    const namePattern = /^[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
    if (!namePattern.test(formData.name)) {
      setError('El nombre solo puede contener letras, números, espacios, apóstrofes y guiones');
      return;
    }

    if (!formData.creation_date) {
      setError('La fecha de creación es requerida');
      return;
    }

    // Normaliza fecha a ISO (UTC) para el backend
    const isoCreation = new Date(formData.creation_date).toISOString();

    setIsSubmitting(true);
    try {
      setError('');
      let savedItem;
      const payload = {
        id_inventory_type: formData.id_inventory_type,
        name: formData.name,
        creation_date: isoCreation,
        active: formData.active,
      };

      if (item) {
        savedItem = await inventoryService.update(item.id, payload);
        if (!savedItem) savedItem = { ...item, ...payload };
        onSuccess(savedItem, true);
      } else {
        savedItem = await inventoryService.create(payload);
        if (!savedItem) {
          savedItem = { id: Date.now().toString(), ...payload };
        }
        onSuccess(savedItem, false);
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.message || 'Error al guardar el inventario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeInventoryTypes = (inventoryTypes || []).filter(t => t.active);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onKeyDown={handleKeyPress}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {item ? 'Editar Inventario' : 'Nuevo Inventario'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Inventario *
              </label>
              <select
                name="id_inventory_type"
                value={formData.id_inventory_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                required
              >
                <option value="">Seleccionar tipo...</option>
                {activeInventoryTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name ?? t.description }
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Ej: Pantalla iPhone 13"
                maxLength={100}
                autoFocus={!item}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de creación *
              </label>
              <input
                type="datetime-local"
                name="creation_date"
                value={formData.creation_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple"
              />
            </div>

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
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

export default InventoryForm;
