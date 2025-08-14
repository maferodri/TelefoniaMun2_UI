import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"

const Layout = ({ children }) => {
    const navigate = useNavigate()
    const location = useLocation
    const { user, logout, validateToken } = useAuth()

    useEffect(() => {
        const interval = setInterval(() => {
            if (!validateToken()) {
                clearInterval(interval);
            }
        }, 60000);

        validateToken();
        return () => clearInterval(interval);
    }, [validateToken]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-[#0f172a]  flex items-center justify-center p-4">
            <div className="mockup-browser border bg-base-300 shadow-xl w-full max-w-6xl">
                <div className="mockup-browser-toolbar">
                    <div className="input">https://telefoniamun2.com</div>
                </div>
                <div className="bg-base-200 p-6">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <div>
                            <h1 className="text-2xl font-sans font-bold text-white">
                                ¡Bienvenido a TelefoniaMun2! 📱
                            </h1>
                            <p className="text-white">
                                Hola {`${user.firstname} ${user.lastname}`}
                            </p>
                        </div>
                        <button 
                            className="bg-purple-200 text-black font-bold px-4 py-2 rounded-full hover:bg-purple-300 transition-colors"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="py-4">
                        <ul className="flex flex-row justify-center space-x-4 flex-wrap">
                            <li>
                                <button 
                                    className="bg-purple-200 text-black py-2 px-4 rounded-full hover:bg-purple-300 font-semibold transition-colors"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    🏠 Inicio
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="bg-purple-200 text-black py-2 px-4 rounded-full hover:bg-purple-300 font-semibold transition-colors"
                                    onClick={() => navigate('/services')}
                                >
                                    📋 Servicios
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="bg-purple-200 text-black py-2 px-4 rounded-full hover:bg-purple-300 font-semibold transition-colors"
                                    onClick={() => navigate('/appointments')}
                                >
                                    🗓️ Citas
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="bg-purple-200 text-black py-2 px-4 rounded-full hover:bg-purple-300 font-semibold transition-colors"
                                    onClick={() => navigate('/inventories')}
                                >
                                    🗃️ Inventarios
                                </button>
                            </li>
                            <li>
                                <button 
                                    className="bg-purple-200 text-black py-2 px-4 rounded-full hover:bg-purple-300 font-semibold transition-colors"
                                    onClick={() => navigate('/inventorytypes')}
                                >
                                    🗂️ Tipos de Inventarios
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Content */}
                    <div className="mt-6">
                        {children}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Layout
