import axios from "axios";

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Application-Name": import.meta.env.VITE_APPLICATION_NAME,
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers["trace"] = generateUUID();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem("account");
        localStorage.removeItem("inventory_settings");
      } catch { }

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
