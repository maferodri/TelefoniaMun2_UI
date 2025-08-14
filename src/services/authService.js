import { API_BASE_URL, handleResponse} from "./api.js"

export const authService = {
    
    login: async (email, password) => {
        try{
            const response  = await fetch( `${API_BASE_URL}/login`, {
                method: 'POST'
                , headers: {
                'Content-Type': 'application/json'
                }
                , body: JSON.stringify({
                    email, password
                })
            });

            // Si no es 2xx, forzamos nuestro mensaje genérico
            if (!response.ok) {
                throw new Error('Correo o contraseña incorrectos');
            }

            const data = await response.json();
            const token = data.token || data.idToken;
            if (!token) throw new Error('Respuesta inválida del servidor'); 

            localStorage.setItem('authToken', token);
            const userInfo = decodeToken(token);
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            return true;

        }catch(error){
            throw new Error('Correo o contraseña incorrectos')
        }
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