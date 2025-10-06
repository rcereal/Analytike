// import { useState, useEffect } from "react";
// import api from "../services/axiosConfig";

// export function useAuth() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const accessToken = localStorage.getItem("access_token");
//   const refreshToken = localStorage.getItem("refresh_token");

//   const login = async (username, password) => {
//     try {
//       const response = await api.post("token/", { username, password });
//       const { access, refresh } = response.data;

//       localStorage.setItem("access_token", access);
//       localStorage.setItem("refresh_token", refresh);

//       api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

//       await fetchUser();
//       return true;
//     } catch (err) {
//       console.error("❌ Erro no login:", err);
//       return false;
//     }
//   };

//   const logout = async () => {
//     try {
//       const refresh = localStorage.getItem("refresh_token");
//       if (refresh) {
//         await api.post("logout/", { refresh });
//       }
//     } catch (err) {
//       console.warn("⚠️ Erro ao invalidar refresh no backend:", err);
//     }

//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     delete api.defaults.headers.common["Authorization"];
//     setUser(null);
//     window.location.href = "/"; // 🔑 volta para login
//   };

//   const fetchUser = async () => {
//     try {
//       const res = await api.get("me/");
//       setUser(res.data);
//     } catch (err) {
//       console.error("❌ Erro ao buscar usuário:", err);
//       setUser(null);
//     }
//   };

//   const refreshAccessToken = async () => {
//     if (!refreshToken) return logout();

//     try {
//       const res = await api.post("token/refresh/", { refresh: refreshToken });
//       const { access } = res.data;
//       localStorage.setItem("access_token", access);
//       api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
//       console.log("🔄 Token renovado automaticamente");
//     } catch (err) {
//       console.error("❌ Erro ao renovar token:", err);
//       logout();
//     }
//   };

//   useEffect(() => {
//     const init = async () => {
//       if (accessToken) {
//         api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
//         try {
//           await fetchUser();
//         } catch {
//           logout();
//         }
//       } else {
//         setUser(null);
//       }
//       setLoading(false);
//     };
//     init();
//   }, []);

//   // 🔄 Renovação automática do token
//   useEffect(() => {
//     let interval;
//     if (refreshToken) {
//       // chama a cada 4 minutos (antes do vencimento atual)
//       interval = setInterval(() => {
//         refreshAccessToken();
//       }, 4 * 60 * 1000);
//     }
//     return () => clearInterval(interval);
//   }, [refreshToken]);

//   return { user, login, logout, loading, refreshAccessToken };
// }

import { useState, useEffect, useRef } from "react";
import api from "../services/axiosConfig";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef(null); // ⏱ controla o agendamento de renovação

  // Tokens do localStorage
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  // 🔹 LOGIN
  const login = async (username, password) => {
    try {
      const response = await api.post("token/", { username, password });
      const { access, refresh } = response.data;

      // Salva tokens localmente
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      await fetchUser();
      scheduleTokenRefresh(); // ⏱ inicia verificação automática
      return true;
    } catch (err) {
      console.error("❌ Erro no login:", err);
      return false;
    }
  };

  // 🔹 LOGOUT
  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await api.post("logout/", { refresh });
    } catch (err) {
      console.warn("⚠️ Erro ao invalidar refresh no backend:", err);
    }

    // Limpa tudo
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    clearTimeout(refreshTimer.current);
    window.location.href = "/"; // 🔑 redireciona para login
  };

  // 🔹 BUSCAR USUÁRIO
  const fetchUser = async () => {
    try {
      const res = await api.get("me/");
      setUser(res.data);
    } catch (err) {
      console.error("❌ Erro ao buscar usuário:", err);
      setUser(null);
    }
  };

  // 🔹 RENOVAR TOKEN
  const refreshAccessToken = async () => {
    if (!refreshToken) return logout();

    try {
      const res = await api.post("token/refresh/", { refresh: refreshToken });
      const { access } = res.data;

      localStorage.setItem("access_token", access);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      console.log("🔄 Token renovado automaticamente.");
      scheduleTokenRefresh(); // reagenda a próxima renovação
    } catch (err) {
      console.error("❌ Erro ao renovar token:", err);
      logout();
    }
  };

  // ⏱ FUNÇÃO PARA AGENDAR RENOVAÇÃO AUTOMÁTICA
  const scheduleTokenRefresh = () => {
    clearTimeout(refreshTimer.current);
    // renova a cada 25 minutos (antes do limite de 30)
    refreshTimer.current = setTimeout(() => {
      console.log("⏰ Renovando token automaticamente...");
      refreshAccessToken();
    }, 25 * 60 * 1000);
  };

  // 🔹 Inicialização
  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        try {
          await fetchUser();
          scheduleTokenRefresh(); // inicia contador após login válido
        } catch {
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    init();

    return () => clearTimeout(refreshTimer.current);
  }, []);

  return { user, login, logout, loading, refreshAccessToken };
}
