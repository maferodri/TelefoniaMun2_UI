// components/AppointmentForm.jsx
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';

const toInputDateTime = (value) => {
  // value puede venir como "2025-07-30T14:30:00" o ISO; para <input type="datetime-local">
  if (!value) return '';
  // si tiene segundos, corta a "YYYY-MM-DDTHH:mm"
  if (typeof value === 'string' && value.length >= 16) return value.slice(0, 16);
  try {
    const d = new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

const isValidObjectId = (s) => /^[0-9a-fA-F]{24}$/.test(s || '');

const AppointmentForm = ({ item, onSuccess, onCancel }) => {
  const { validateToken, user } = useAuth(); // asumo user.admin viene del token
  const isAdmin = !!user?.admin;

  const [formData, setFormData] = useState({
    user_id: item?.user_id || '',                     // visible/obligatorio solo para admin
    date_appointment: toInputDateTime(item?.date_appointment) || '',
    comment: item?.comment ?? '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Validaciones de negocio espejo del backend
  const validate = () => {
    // admin: user_id requerido y con formato ObjectId
    if (isAdmin) {
      if (!formData.user_id) return 'El usuario es requerido (admin).';
      if (!isValidObjectId(formData.user_id)) return 'user_id inválido (debe ser ObjectId de 24 hex).';
    }

    // comment
    const comment = (formData.comment || '').trim();
    if (!comment) return 'El comentario es requerido.';
    const commentPattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
    if (!commentPattern.test(comment)) return 'El comentario solo puede contener letras, espacios, apóstrofes y guiones.';

    // fecha/hora
    if (!formData.date_appointment) return 'La fecha de la cita es requerida.';
    // Nota: datetime-local retorna "YYYY-MM-DDTHH:mm" (sin zona). Lo mandaremos tal cual.
    const nowLocal = new Date();
    const chosen = new Date(formData.date_appointment.replace(' ', 'T')); // seguro
    if (isNaN(chosen.getTime())) return 'Fecha de cita inválida.';

    if (chosen <= nowLocal) return 'La fecha de la cita debe ser en el futuro.';

    // ventana 09:00–17:00 (validación rápida en cliente; el backend volverá a validar)
    const hh = Number(formData.date_appointment.slice(11, 13));
    const mm = Number(formData.date_appointment.slice(14, 16) || '0');
    if (hh < 9 || hh > 17 || (hh === 17 && mm > 0)) {
      return 'Las citas solo pueden crearse entre 09:00 y 17:00.';
    }

    return null;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!validateToken()) return;

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setIsSubmitting(true);
    try {
      setError('');

      // Payload: NO mandes user_id si NO es admin
      const payload = {
        date_appointment: formData.date_appointment, // "YYYY-MM-DDTHH:mm"
        comment: formData.comment.trim(),
        ...(isAdmin ? { user_id: formData.user_id } : {}),
      };

      let saved;
      if (item?.id) {
        saved = await appointmentService.update(item.id, payload);
        if (!saved) saved = { ...item, ...payload };
        onSuccess(saved, true);
      } else {
        saved = await appointmentService.create(payload);
        if (!saved) {
          saved = {
            id: Date.now().toString(),
            ...payload,
            active: true,
          };
        }
        onSuccess(saved, false);
      }
    } catch (err) {
      console.error('Error al guardar cita:', err);
      // mapea mensajes típicos de tu backend
      const msg =
        err?.message ||
        err?.detail ||
        'Error al guardar la cita';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSubmitting) handleSubmit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onKeyDown={handleKeyDown}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {item ? 'Editar Cita' : 'Nueva Cita'}
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
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario (user_id) *
                </label>
                <input
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="ObjectId del usuario (24 hex)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Como admin es obligatorio. Debe ser un ObjectId válido.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora de la cita *
              </label>
              <input
                type="datetime-local"
                name="date_appointment"
                value={formData.date_appointment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Debe estar entre 09:00 y 17:00.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentario *
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Motivo de la cita…"
                maxLength={200}
              />
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

export default AppointmentForm;
