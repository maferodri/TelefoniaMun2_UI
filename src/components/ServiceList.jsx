
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { servicesService } from "../services/servicesService";
import Layout from "./Layout";
import ServiceForm from "./ServiceForm";
import { useNavigate } from "react-router-dom"

const ServiceList = () => {
  const [services, setServices] = useState([]);       // antes: service (singular) 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { validateToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (recentlyUpdated) {
      const t = setTimeout(() => setRecentlyUpdated(null), 2000);
      return () => clearTimeout(t);
    }
  }, [recentlyUpdated]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await servicesService.getAll();
      // tu backend devuelve list[Service], no viene envuelto
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar servicios:", err);
      setError(err.message || "Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (!validateToken()) return;

    const confirmed = window.confirm(
      `¿Estás seguro de desactivar el servicio "${item.name}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      setError("");
      await servicesService.deactivate(item.id);
      await loadData();
      setSuccessMessage("Servicio desactivado exitosamente");
    } catch (err) {
      console.error("Error al desactivar:", err);
      setError(err.message || "Error al desactivar el servicio");
    }
  };

  const handleFormSuccess = async (savedItem, isEdit = false) => {
    await loadData();
    setRecentlyUpdated(savedItem.id);
    setSuccessMessage(isEdit ? "Servicio actualizado exitosamente" : "Servicio creado exitosamente");
    setShowForm(false);
    setEditingItem(null);
    setError("");
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(Number(amount) || 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-white-600">Cargando servicios...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white-800">Servicios</h1>
        <button
          onClick={handleCreate}
          className="bg-purple-200 hover:bg-purple-300 text-black font-medium py-2 px-4 rounded-md transition-colors"
        >
          + Nuevo Servicio
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
              <th className="px-20 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-20 py-3 text-left text-xs font-medium text-whie-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray divide-y divide-gray-200">
            {services.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-white">
                  No hay servicios registrados
                </td>
              </tr>
            ) : (
              services.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-500 transition-colors ${
                    recentlyUpdated === item.id ? "bg-green-50 border-l-4 border-green-400" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="truncate block max-w-xs">{item.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white-900">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-300 hover:text-blue-400 mr-3"
                    >
                      Editar
                    </button>
                    {item.active && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-300 hover:text-red-400"
                      >
                        Desactivar
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
        <ServiceForm
          item={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </Layout>
  );
};

export default ServiceList;