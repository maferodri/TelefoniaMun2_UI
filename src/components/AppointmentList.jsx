// components/AppointmentList.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { appointmentService } from "../services/appointmentService";
import Layout from "./Layout";
import AppointmentForm from "./AppointmentForm";


const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { validateToken, user } = useAuth();
  const isAdmin = !!user?.admin;

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
      const data = await appointmentService.getAll();
      // Soporta dos formas de respuesta: array o { appointments, total, ... }
      const list = Array.isArray(data) ? data : Array.isArray(data?.appointments) ? data.appointments : [];
      setAppointments(list);
    } catch (err) {
      console.error("Error al cargar citas:", err);
      setError(err?.message || "Error al cargar las citas");
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

  const handleDisable = async (item) => {
    if (!validateToken()) return;

    const dt = formatDateTime(item.date_appointment);
    const confirmed = window.confirm(
      `¿Desactivar la cita del ${dt}?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      setError("");
      await appointmentService.disable(item.id);
      await loadData();
      setSuccessMessage("Cita desactivada exitosamente");
    } catch (err) {
      console.error("Error al desactivar:", err);
      setError(err?.message || "Error al desactivar la cita");
    }
  };

  const handleFormSuccess = async (savedItem, isEdit = false) => {
    await loadData();
    setRecentlyUpdated(savedItem.id);
    setSuccessMessage(isEdit ? "Cita actualizada exitosamente" : "Cita creada exitosamente");
    setShowForm(false);
    setEditingItem(null);
    setError("");
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const formatDateTime = (value) => {
    try {
      const d = new Date(value);
      return new Intl.DateTimeFormat("es-HN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return String(value ?? "");
    }
  };

  const userDisplay = (item) => {
    // Muestra lo mejor disponible: nombre, email o último tramo de id
    const name = item.user_name || item.name || item.fullname;
    if (name) return name;
    const email = item.userEmail || item.email;
    if (email) return email;
    const id = item.user_id || item.userId;
    if (!id) return "—";
    return id.length > 8 ? `…${id.slice(-8)}` : id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-white">Cargando citas...</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white-800">Citas</h1>
        <button
          onClick={handleCreate}
          className="bg-purple-200 hover:bg-purple-300 text-black rounded-full font-medium py-2 px-4 rounded-md transition-colors"
        >
          + Nueva Cita
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
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Fecha / Hora
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                Comentario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white-500 uppercase tracking-wider">
                Usuario
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
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-white-500">
                  No hay citas registradas
                </td>
              </tr>
            ) : (
              appointments.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-500 transition-colors ${
                    recentlyUpdated === item.id ? "bg-gray-200 border-l-4 border-green-500" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white-900">
                    {formatDateTime(item.date_appointment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="truncate block max-w-xs">
                      {item.comment || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white-600">
                    {userDisplay(item)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        new Date(item.date_appointment) < new Date()
                          ? "bg-red-100 text-red-800"
                          : item.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {new Date(item.date_appointment) < new Date()
                        ? "Inactivo"
                        : item.active
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-200 hover:text-blue-300 mr-3"
                    >
                      Editar
                    </button>
                    {item.active && (
                      <button
                        onClick={() => handleDisable(item)}
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
        <AppointmentForm
          item={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </Layout>
  );
};

export default AppointmentList;
