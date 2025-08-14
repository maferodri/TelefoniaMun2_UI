import { useState, useEffect } from 'react';
import { inventoryTypeService } from '../services/inventoryTypeService';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import InventoryTypeForm from './InventoryTypeForm';

const InventoryTypesList = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { validateToken } = useAuth();

  useEffect(() => { loadTypes(); }, []);
  useEffect(() => {
    if (recentlyUpdated) {
      const t = setTimeout(() => setRecentlyUpdated(null), 2000);
      return () => clearTimeout(t);
    }
  }, [recentlyUpdated]);
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const loadTypes = async () => {
    if (!validateToken()) return;
    try {
      setLoading(true);
      setError('');
      const data = await inventoryTypeService.getAll();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar tipos de inventario:', err);
      setError(err.message || 'Error al cargar los tipos de inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => { setEditingItem(null); setShowForm(true); };
  const handleEdit = (item) => { setEditingItem(item); setShowForm(true); };

  const handleDelete = async (item) => {
    if (!validateToken()) return;

    const hasItems = (item.number_of_items || 0) > 0;
    const action = hasItems ? 'desactivar' : 'eliminar';
    const consequence = hasItems
      ? `Este tipo tiene ${item.number_of_items} item(s) asociado(s). Se desactivará.`
      : 'Este tipo será eliminado permanentemente.';

    const confirmed = window.confirm(
      `¿Estás seguro de ${action} el tipo "${item.name ?? item.description}"?\n\n${consequence}\n\n¿Deseas continuar?`
    );
    if (!confirmed) return;

    try {
      setError('');
      await inventoryTypeService.deactivate(item.id);
      await loadTypes();
      setSuccessMessage(hasItems ? 'Tipo desactivado exitosamente' : 'Tipo eliminado exitosamente');
    } catch (err) {
      console.error('Error al procesar:', err);
      setError(err.message || `Error al ${action} el tipo de inventario`);
    }
  };

  const handleFormSuccess = async (savedItem, isEdit = false) => {
    await loadTypes();
    setRecentlyUpdated(savedItem.id);
    setSuccessMessage(isEdit ? 'Tipo actualizado exitosamente' : 'Tipo creado exitosamente');
    setShowForm(false);
    setEditingItem(null);
    setError('');
  };

  const handleFormCancel = () => { setShowForm(false); setEditingItem(null); };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-white-600">Cargando tipos de inventario...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white-800">Tipos de Inventario</h1>
        <button
          onClick={handleCreate}
          className="bg-purple-200 hover:bg-purple-300 text-black font-medium py-2 px-4 rounded-md transition-colors"
        >
          + Nuevo Tipo
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="bg-gray shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-gray divide-y divide-gray-200">
            {types.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-white-500">No hay tipos registrados</td>
              </tr>
            ) : (
              types.map(item => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-600 transition-colors ${recentlyUpdated === item.id ? 'bg-green-50 border-l-4 border-green-400' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white-900">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.name ?? item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white-500">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      (item.number_of_items || 0) > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.number_of_items || 0} items
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(item)} className="text-blue-200 hover:text-blue-300 mr-3">Editar</button>
                    {item.active && (
                      <button
                        onClick={() => handleDelete(item)}
                        className={`${(item.number_of_items || 0) > 0 ? 'text-red-300 hover:text-red-400' : 'text-red-600 hover:text-red-900'}`}
                      >
                        {(item.number_of_items || 0) > 0 ? 'Desactivar' : 'Eliminar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <InventoryTypeForm
          item={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </Layout>
  );
};

export default InventoryTypesList;
