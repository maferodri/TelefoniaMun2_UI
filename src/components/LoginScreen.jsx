import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
import { useAuth} from "../context/AuthContext";

const LoginScreen = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading ] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

       try {
        const success = await login(email, password); // login devuelve true o lanza error
        if (success) {
            navigate("/dashboard");
        } else {
            // Si login devuelve false
            setError("Correo o contraseña incorrectos. Intente de nuevo.");
        }
        } catch (err) {
            console.error("Error en login:", err);
            // Si backend manda mensaje en detail, úsalo
            const msg = err?.message || err?.detail || "Correo o contraseña incorrectos. Intente de nuevo.";
            setError(msg);
        } finally {
            setLoading(false);
    }
    }

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
          <div className="mb-4 p-3 bg-red-900 border border-red-500 text-red-300 rounded-md">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="input input-bordered w-full bg-[#0b1220] text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="input input-bordered w-full bg-[#0b1220] text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-primary w-full text-black rounded-full bg-purple-200 hover:bg-purple-300 border-none"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
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