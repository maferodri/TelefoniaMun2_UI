import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import { useAuth} from "../context/AuthContext";

const LoginScreen = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

     const handleLogin = async () => {
        // Evitar múltiples envíos
        if (isSubmitting) {
            return;
        }

        setError("");
        setIsSubmitting(true);

        // Validaciones básicas (solo formato, no complejidad)
        if (!email.trim()) {
            setError('El email es requerido');
            setIsSubmitting(false);
            return;
        }

        // Validación básica de formato de email (no tan estricta)
        if (!email.includes('@') || !email.includes('.')) {
            setError('Por favor ingresa un email válido');
            setIsSubmitting(false);
            return;
        }

        if (!password.trim()) {
            setError('La contraseña es requerida');
            setIsSubmitting(false);
            return;
        }
        
        // Sin validaciones complejas de contraseña para login
        // El servidor validará las credenciales

        try {
            console.log("Intentando login con:", { email, password: "***" });
            const result = await login(email, password);
            console.log("Resultado del login:", result);
            if (result) {
                navigate("/dashboard", { replace: true });
            }
        } catch (error) {
            console.error("Error en login:", error);
            // Intentar mostrar error.message si existe
            let msg = '';
            if (typeof error === 'string') {
                msg = error;
            } else if (error?.message) {
                msg = error.message;
            } else {
                // Para cualquier otro objeto
                msg = JSON.stringify(error);
            }

            setError(msg || 'Error en email o contraseña.');
        } finally {
            setIsSubmitting(false);
        }
    };

return (
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
    <div className="mockup-browser border border-gray-700 bg-[#111827] w-full max-w-lg">
      <div className="mockup-browser-toolbar">
        <div className="input">https://telefoniemun2.com/login</div>
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
          <p className="text-gray-400">Inicia sesión</p>
        </div>

        {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                <span>{error}</span>
              </div>
            </div>
        )}

        {/* Formulario */}
        <form 
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}>
          <input
            type="email"
            placeholder="correo@gmail.com"
            className="input input-bordered w-full bg-[#0b1220] text-white"
            value={email}
            onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(''); // Limpiar error cuando el usuario escriba
                    }}
          />

          <input
            type="password"
            placeholder="*******"
            className="input input-bordered w-full bg-[#0b1220] text-white"
            value={password}
            onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(''); // Limpiar error cuando el usuario escriba
                    }}
          />

          <button
            type="submit"
            className="btn btn-primary w-full text-black rounded-full bg-purple-200 hover:bg-purple-300 border-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Link */}
        <p className="text-center text-sm text-gray-400 mt-4">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="text-purple-400 hover:text-purple-300">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  </div>
);



}

export default LoginScreen