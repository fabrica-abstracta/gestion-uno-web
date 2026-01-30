import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Application-Name": import.meta.env.VITE_APPLICATION_NAME,
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem("account");
      } catch { }

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
