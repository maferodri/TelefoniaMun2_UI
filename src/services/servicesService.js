import { API_BASE_URL, handleResponse } from "./api.js";

const authHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const normalizeService = (s) => {
  if (!s) return s;
  // Normaliza _id -> id (sin romper si ya viene id)
  const id = s.id ?? s._id ?? s._id?.$oid ?? s._id?.oid;
  return { ...s, id };
};

const normalizeList = (arr) => Array.isArray(arr) ? arr.map(normalizeService) : [];

export const servicesService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(), // incluye token si tu endpoint es protegido
        },
      });
      const data = await handleResponse(response);
      return normalizeList(data);
    } catch (error) {
      console.error("Error al obtener los servicios:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });
      const data = await handleResponse(response);
      return normalizeService(data);
    } catch (error) {
      console.error("Error al obtener el servicio:", error);
      throw error;
    }
  },

  create: async (service) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          name: service.name,
          description: service.description,
          // 👇 usar price desde el form (no cost)
          price: parseFloat(service.price),
          active: service.active ?? true,
        }),
      });
      const data = await handleResponse(response);
      return normalizeService(data);
    } catch (error) {
      console.error("Error al crear servicio:", error);
      throw error;
    }
  },

  update: async (id, service) => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "PUT", // ajusta a PATCH si tu backend lo requiere
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          name: service.name,
          description: service.description,
          // 👇 usar price desde el form (no cost)
          price: parseFloat(service.price),
          active: service.active ?? true,
        }),
      });
      const data = await handleResponse(response);
      return normalizeService(data);
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      throw error;
    }
  },

  deactivate: async (id) => {
    try {
      // Si tu backend hace “baja lógica” con DELETE está ok.
      // Si requiere PATCH a /services/:id con { active: false }, cambia aquí.
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      });
      const data = await handleResponse(response);
      return normalizeService(data);
    } catch (error) {
      console.error("Error al desactivar servicio:", error);
      throw error;
    }
  },
};
