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

// Arquivo: src/services/axiosConfig.js

// -------------------------------------------------------------------------

// import axios from "axios";
// // NÃO precisamos mais da biblioteca 'js-cookie'
// // import Cookies from "js-cookie";

// // ✅ Função JavaScript pura para ler um cookie pelo nome
// function getCookie(name) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== "") {
//     const cookies = document.cookie.split(";");
//     for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i].trim();
//       if (cookie.substring(0, name.length + 1) === name + "=") {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }

// console.log("✅ [axiosConfig] Módulo carregado. Criando instância 'api'.");

// const api = axios.create({
//   baseURL: "https://analytike.onrender.com/api/",
//   withCredentials: true,
// });

// api.interceptors.request.use(
//   (config) => {
//     console.log(
//       "🚀 [Interceptor] A requisição para",
//       config.url,
//       "foi interceptada."
//     );

//     // ✅ Trocamos Cookies.get() pela nossa função getCookie()
//     const csrfToken = getCookie("csrftoken");

//     if (csrfToken) {
//       console.log("🍪 [Interceptor] Token CSRF encontrado:", csrfToken);
//       config.headers["X-CSRFToken"] = csrfToken;
//     } else {
//       console.warn("⚠️ [Interceptor] Token CSRF NÃO encontrado nos cookies.");
//     }

//     return config;
//   },
//   (error) => {
//     console.error(
//       "❌ [Interceptor] Erro na configuração da requisição:",
//       error
//     );
//     return Promise.reject(error);
//   }
// );

// export default api;

// src/services/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://analytike.onrender.com/api/",
});

// 🔹 Interceptor: sempre adiciona o token JWT no header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) {
          console.warn("⚠️ Nenhum refresh_token encontrado. Deslogando.");
          return Promise.reject(error);
        }
        const response = await axios.post(
          "https://analytike.onrender.com/api/token/refresh/",
          { refresh }
        );

        const newAcessToken = response.data.access;
        localStorage.setItem("access_token", newAcessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAcessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Erro ao tentar renovar token:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
