import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isValidEmail, validatePassword, getPasswordStrength, isValidPhone} from "../utils/validators";

const SignupScreen = () => {
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register } = useAuth(); // Removemos loading del contexto para el signup también
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar errores cuando el usuario empiece a escribir
        if (error) setError('');
    };

    const handleSignup = async () => {
        // Evitar múltiples envíos
        if (isSubmitting) {
            return;
        }
        
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        // Validaciones básicas
        if (!formData.name.trim()) {
            setError('El nombre es requerido');
            setIsSubmitting(false);
            return;
        }
        if (!formData.lastname.trim()) {
            setError('El apellido es requerido');
            setIsSubmitting(false);
            return;
        }
        if (!formData.email.trim()) {
            setError('El email es requerido');
            setIsSubmitting(false);
            return;
        }
          if (!formData.phone.trim()) {
            setError('El telefono es requerido');
            setIsSubmitting(false);
            return;
        }
        
        // Validación de formato de email
        if (!isValidEmail(formData.email)) {
            setError('Por favor ingresa un email válido');
            setIsSubmitting(false);
            return;
        }

        if (!isValidPhone(formData.phone.trim())) {
             setError('Por favor ingresa un teléfono válido (ejemplo: 9999-9999 o +504 9999-9999)');
             setIsSubmitting(false);
            return;
        }
        
        // Validaciones de contraseña
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.message);
            setIsSubmitting(false);
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await register(formData.name, formData.lastname, formData.email, formData.phone , formData.password);
            if (result) {
                setSuccess('¡Cuenta creada exitosamente!');
                setShowSuccessModal(true);

                // Limpiar formulario
                setFormData({
                    name: '',
                    lastname: '',
                    email: '',
                    phone: '', 
                    password: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error('Error en registro:', error);
            setError(error.message || 'Error al crear la cuenta. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="mockup-browser border border-gray-700 bg-[#111827] w-full max-w-lg">
          <div className="mockup-browser-toolbar">
            <div className="input">https://telefoniemun2.com/signup</div>
          </div>
          <div className="bg-[#111827] p-8 rounded-b-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                TelefoniaMun2
              </h1>
              <p className="text-gray-400">Crear cuenta nueva</p>
            </div>

            {/* Mensajes */}
            {error && (
              <div
                className={`mb-4 p-3 rounded-md border ${
                  error.includes("email ya está registrado") ||
                  error.includes("usuario ya existe")
                    ? "bg-orange-100 border-orange-400 text-orange-700"
                    : "bg-red-100 border-red-400 text-red-700"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-2">
                    {error.includes("email ya está registrado") ||
                    error.includes("usuario ya existe")
                      ? "⚠️"
                      : "❌"}
                  </span>
                  <span>{error}</span>
                </div>

                {(error.includes("email ya está registrado") ||
                  error.includes("usuario ya existe")) && (
                  <div className="mt-2 text-sm">
                    <Link
                      to="/login"
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      ¿Ya tienes cuenta? Inicia sesión aquí
                    </Link>
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form className="space-y-4"
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSignup();
                    }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre"
                    className="input input-bordered bg-[#0b1220] text-white"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Apellido</label>
                  <input
                    type="text"
                    placeholder="Apellido"
                    className="input input-bordered bg-[#0b1220] text-white"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="nombre@gmail.com"
                  className="input input-bordered w-full bg-[#0b1220] text-white"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                <input
                  type="tel"
                  placeholder="9999-5555"
                  className="input input-bordered w-full bg-[#0b1220] text-white"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                <input
                  type="password"
                  placeholder="*******"
                  className="input input-bordered w-full bg-[#0b1220] text-white"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {/* Validación visible solo si hay algo escrito */}
                {formData.password && (
                  <div className="mt-2 space-y-1 text-xs text-gray-400">
                    {(() => {
                      const strength = getPasswordStrength(formData.password);
                      return (
                        <>
                          <div className={`flex items-center ${strength.isValidLength ? 'text-green-500' : 'text-gray-400'}`}>
                            <span className="mr-1">{strength.isValidLength ? '✓' : '○'}</span>
                            8-64 caracteres
                          </div>
                          <div className={`flex items-center ${strength.hasUppercase ? 'text-green-500' : 'text-gray-400'}`}>
                            <span className="mr-1">{strength.hasUppercase ? '✓' : '○'}</span>
                            Al menos una mayúscula
                          </div>
                          <div className={`flex items-center ${strength.hasNumber ? 'text-green-500' : 'text-gray-400'}`}>
                            <span className="mr-1">{strength.hasNumber ? '✓' : '○'}</span>
                            Al menos un número
                          </div>
                          <div className={`flex items-center ${strength.hasSpecialChar ? 'text-green-500' : 'text-gray-400'}`}>
                            <span className="mr-1">{strength.hasSpecialChar ? '✓' : '○'}</span>
                            Carácter especial (@$!%*?&)
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  placeholder="******"
                  className="input input-bordered w-full bg-[#0b1220] text-white"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full rounded-full text-black bg-purple-200 hover:bg-purple-300 border-none"
              >
                {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </form>

            {/* Link */}
            <p className="text-center text-sm text-gray-400 mt-4">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-purple-400 hover:text-purple-300">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
        {/* → Aquí va tu modal ← */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="relative bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Cuenta creada</h3>
              </div>
              <p className="text-gray-600 mb-4">{success} Presiona "Aceptar" para ir al login.</p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login', { replace: true })}
                  className="px-4 py-2 rounded-full bg-purple-400 text-white hover:bg-purple-500"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

};

export default SignupScreen;