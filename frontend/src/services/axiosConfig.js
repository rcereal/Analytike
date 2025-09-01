import axios from "axios";
import Cookies from "js-cookie"; // npm install js-cookie

const api = axios.create({
  baseURL: "https://analytike.onrender.com/api/",
  withCredentials: true, // 🔑 mantém cookies de sessão
});

// Interceptor para sempre enviar o CSRF
api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get("csrftoken");
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

export default api;
