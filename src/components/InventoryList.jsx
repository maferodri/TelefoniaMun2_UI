import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { inventoryTypeService } from '../services/inventoryTypeService';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import InventoryForm from './InventoryForm';

const InventoryList = () => {
  const [items, setItems] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { validateToken } = useAuth();

  useEffect(() => { loadData(); }, []);
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const invData = await inventoryService.getAll();
      // soporte: dict { inventories: [] } o arreglo []
      const arr = Array.isArray(invData) ? invData : (invData?.inventories ?? []);
      setItems(arr);

      try {
        const t = await inventoryTypeService.getAll();
        setTypes(Array.isArray(t) ? t : []);
      } catch (typeErr) {
        console.warn('Error al cargar tipos de inventario:', typeErr);
        setTypes([]);
      }
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError(err.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => { setEditingItem(null); setShowForm(true); };
  const handleEdit = (it) => { setEditingItem(it); setShowForm(true); };

  const handleDelete = async (it) => {
    if (!validateToken()) return;
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${it.name}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      setError('');
      await inventoryService.remove(it.id);
      await loadData();
      setSuccessMessage('Item eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError(err.message || 'Error al eliminar el item');
    }
  };

  const handleFormSuccess = async (savedItem, isEdit = false) => {
    await loadData();
    setRecentlyUpdated(savedItem.id);
    setSuccessMessage(isEdit ? 'Item actualizado exitosamente' : 'Item creado exitosamente');
    setShowForm(false);
    setEditingItem(null);
    setError('');
  };

  const handleFormCancel = () => { setShowForm(false); setEditingItem(null); };

  const getTypeName = (it) => {
    // si en el pipeline ya viene “inventory_type_name/description”, úsalo
    return it.inventory_type_name || it.inventory_type_description ||
           types.find(t => (t.id === it.id_inventory_type))?.name ||
           'Tipo no encontrado';
  };

  const fmtDate = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-HN');
    } catch { return '-'; }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-white">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white-800">Inventario</h1>
        <button
          onClick={handleCreate}
          className="bg-purple-200 hover:bg-purple-300 text-black font-medium py-2 px-4 rounded-md transition-colors"
        >
          + Nuevo Item
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
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Fecha creación</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-gray divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-white-500">No hay items registrados</td>
              </tr>
            ) : (
              items.map((it) => (
                <tr
                  key={it.id}
                  className={`hover:bg-gray-500 transition-colors ${recentlyUpdated === it.id ? 'bg-green-50 border-l-4 border-green-400' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white-900">{it.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white-600">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getTypeName(it)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white-900">
                    {fmtDate(it.creation_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      it.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {it.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(it)} className="text-blue-200 hover:text-blue-300 mr-3">Editar</button>
                    {it.active && (
                      <button onClick={() => handleDelete(it)} className="text-red-300 hover:text-red-400">Eliminar</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <InventoryForm
          item={editingItem}
          inventoryTypes={types}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </Layout>
  );
};

export default InventoryList;
