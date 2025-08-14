import { API_BASE_URL, handleResponse } from "./api.js";

export const inventoryService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventories`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventories/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al obtener item de inventario:', error);
      throw error;
    }
  },

  create: async (item) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inventories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          id_inventory_type: item.id_inventory_type,
          name: item.name,
          creation_date: item.creation_date, // ISO string
          active: item.active ?? true
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al crear item de inventario:', error);
      throw error;
    }
  },

  update: async (id, item) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inventories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          id_inventory_type: item.id_inventory_type,
          name: item.name,
          creation_date: item.creation_date, // ISO string
          active: item.active
        })
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar item de inventario:', error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/inventories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error al eliminar item de inventario:', error);
      throw error;
    }
  }
};
