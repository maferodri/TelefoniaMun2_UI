import { useAuth } from "../context/AuthContext"
import Layout from "./Layout"

const Dashboard = () => {
    const { user } = useAuth()

    return (
        <Layout>
            <div className="bg-gray rounded-lg shadow-md p-8 text-center">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Selecciona una opción del menú para comenzar
                </h2>
                <p className="text-gray-300">
                    En TelefoniaMun2 nos especializamos en la reparación de teléfonos de todas las marcas y modelos.
                    Contamos con técnicos expertos que realizan diagnósticos rápidos, utilizan repuestos originales y garantizan un servicio de alta calidad.
                    Nuestro compromiso es devolverle la vida a tu dispositivo de forma segura, rápida y eficiente, para que sigas conectado con lo que más importa.
                </p>
            </div>
        </Layout>
    )
}

export default Dashboard