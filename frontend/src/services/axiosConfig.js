// import axios from "axios";
// import Cookies from "js-cookie"; // npm install js-cookie

// const api = axios.create({
//   baseURL: "https://analytike.onrender.com/api/",
//   withCredentials: true, // 🔑 mantém cookies de sessão
// });

// // Interceptor para sempre enviar o CSRF
// api.interceptors.request.use((config) => {
//   const csrfToken = Cookies.get("csrftoken");
//   if (csrfToken) {
//     config.headers["X-CSRFToken"] = csrfToken;
//   }
//   return config;
// });

// export default api;

// Arquivo: src/services/axiosConfig.js

import axios from "axios";
import Cookies from "js-cookie";

console.log("✅ [axiosConfig] Módulo carregado. Criando instância 'api'.");

const api = axios.create({
  baseURL: "https://analytike.onrender.com/api/",
  withCredentials: true,
});

// Interceptor para sempre enviar o CSRF
api.interceptors.request.use(
  (config) => {
    console.log(
      "🚀 [Interceptor] A requisição para",
      config.url,
      "foi interceptada."
    );

    const csrfToken = Cookies.get("csrftoken");

    if (csrfToken) {
      console.log("🍪 [Interceptor] Token CSRF encontrado:", csrfToken);
      config.headers["X-CSRFToken"] = csrfToken;
    } else {
      console.warn("⚠️ [Interceptor] Token CSRF NÃO encontrado nos cookies.");
    }

    return config;
  },
  (error) => {
    console.error(
      "❌ [Interceptor] Erro na configuração da requisição:",
      error
    );
    return Promise.reject(error);
  }
);

export default api;
