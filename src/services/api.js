//Configuracion base de la API
const API_BASE_URL = 'https://telefonia-api-production.up.railway.app';

//Configuracion base para las peticiones
const apiConfig = {
    headers: {
    'Content-Type': 'application/json',
    }
};

//Función helper para manejar respuestas de la API
export async function handleResponse(res) {
  const ct = res.headers.get("content-type") || "";
  let data = null;
  let text = null;

  try {
    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      text = await res.text();
    }
  } catch {}

  if (res.ok) return data ?? (text ?? null);

  const extract = (payload) => {
    if (!payload) return null;
    if (typeof payload === "string") return payload;
    if (payload.detail) {
      if (typeof payload.detail === "string") return payload.detail;
      if (Array.isArray(payload.detail)) {
        // Errores de Pydantic
        return payload.detail
          .map((d) => d?.msg || d?.message || JSON.stringify(d))
          .join(" | ");
      }
    }
    return payload.message || payload.error || null;
  };

  const serverMsg = extract(data) || extract(text);

  const fallback =
    ({
      400: "Solicitud inválida.",
      401: "Credenciales inválidas.",
      403: "No tienes permisos para realizar esta acción.",
      404: "El recurso solicitado no fue encontrado.",
      409: "Conflicto con datos existentes.",
      422: "Datos inválidos. Revisa los campos.",
      500: "Error interno del servidor. Intenta más tarde.",
    }[res.status] || `Error ${res.status}: ${res.statusText || "Desconocido"}`);

  const err = new Error(serverMsg || fallback);
  err.status = res.status;
  err.data = data ?? text;
  throw err;
}
export { API_BASE_URL };