import { API_BASE_URL, handleResponse} from "./api.js"

export const authService = {
    
    login: async (email, password) => {
            const response  = await fetch( `${API_BASE_URL}/login`, {
                method: 'POST'
                , headers: {
                'Content-Type': 'application/json'
                }
                , body: JSON.stringify({
                    email, password
                })
            });

            // Manejo explícito para evitar redirecciones globales del handleResponse en 401
            if (!response.ok) {
                // Intentar leer el cuerpo para obtener mensaje del backend
                let message = 'Credenciales invalida. Verifica tu email y contraseña.';
                try {
                    const errData = await response.json();
                    if (errData && (errData.detail || errData.message)) {
                        message = errData.detail || errData.message;
                    }
                } catch {
                    // Ignorar errores de parseo
                }

                if (response.status === 401) {
                    // Mensaje claro para credenciales inválidas
                    throw new Error('Credenciales inválidas. Verifica tu email y contraseña.');
                }

                throw new Error(message);
            }

            const data = await response.json();

            if (data.token){
                localStorage.setItem('authToken', data.token);
                const userInfo = decodeToken(data.token);
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }
            return data;
    },

    register: async (name, lastname, email, phone, password) => {
        try{
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name, 
                    lastname,
                    email,
                    phone,
                    password
                })
            });

            const data = await handleResponse(response);
            return data;
        } catch (error) {
            console.error('Error en registro', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
    },
    
    //ver que el token no haya expirado
    isAuthenticated: () => {
        const token = localStorage.getItem('authToken');
        if (!token) return false;

        try{
            const userInfo = decodeToken(token);
            return userInfo.exp * 1000 > Date.now()
        } catch (error){
            return false; 
        }
    }, 
    
    //Retornar info del usuario 
    getCurrentUser: () => {
        try {
             const cached = localStorage.getItem("userInfo");
            if (cached) return JSON.parse(cached);

            const token = localStorage.getItem("authToken");
            if (!token) return null;

            const decoded = decodeToken(token);
            localStorage.setItem("userInfo", JSON.stringify(decoded));
            return decoded;
        } catch {
            return null;
        }
    },

    getToken: () => {
        return localStorage.getItem('authToken')
    }
}

const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decodificando token', error);
        throw new Error('Token Invalido');
    }
};