import axios from "axios";

// Token getter function - will be set by useAxiosAuth hook
type TokenGetter = () => Promise<string>;
let getAuthToken: TokenGetter | null = null;

export function setAuthTokenGetter(getter: TokenGetter | null) {
    getAuthToken = getter;
}

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL as string,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
axiosClient.interceptors.request.use(
    async (config) => {
        if (getAuthToken) {
            try {
                const token = await getAuthToken();
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error("Failed to get auth token:", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - could redirect to login
            console.error("Unauthorized access - redirecting to login");
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
