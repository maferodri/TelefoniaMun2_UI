import { API_BASE_URL, handleResponse } from "./api.js";

export const inventoryTypeService = {
  getAll: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inventorytypes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al obtener tipos de inventario:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inventorytypes/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al obtener tipo de inventario:', error);
      throw error;
    }
  },

  create: async (type) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inventorytypes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: type.name,
          active: type.active ?? true
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al crear tipo de inventario:', error);
      throw error;
    }
  },

  update: async (id, type) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inventorytypes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: type.name,
          active: type.active
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar tipo de inventario:', error);
      throw error;
    }
  },

  deactivate: async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inventorytypes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al desactivar/eliminar tipo de inventario:', error);
      throw error;
    }
  }
};
