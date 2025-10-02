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
//         await api.post("logout/", { refresh }); // 🔑 chama o backend para invalidar
//       }
//     } catch (err) {
//       console.warn("⚠️ Erro ao invalidar refresh no backend:", err);
//     }

//     // 🔑 Limpa tokens e usuário
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     delete api.defaults.headers.common["Authorization"];
//     setUser(null);

//     // 🔑 Força redirect para tela de login
//     window.location.href = "/login";
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
//           logout(); // ✅ força logout se não conseguir buscar user
//         }
//       } else {
//         setUser(null);
//       }
//       setLoading(false);
//     };
//     init();
//   }, []);

//   return { user, login, logout, loading, refreshAccessToken };
// }

import { useState, useEffect } from "react";
import api from "../services/axiosConfig";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  const login = async (username, password) => {
    try {
      const response = await api.post("token/", { username, password });
      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      await fetchUser();
      return true;
    } catch (err) {
      console.error("❌ Erro no login:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await api.post("logout/", { refresh });
      }
    } catch (err) {
      console.warn("⚠️ Erro ao invalidar refresh no backend:", err);
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);

    // 🔄 força recarregar a página para cair na tela de login
    window.location.href = "/";
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("me/");
      setUser(res.data);
    } catch (err) {
      console.error("❌ Erro ao buscar usuário:", err);
      setUser(null);
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return logout();

    try {
      const res = await api.post("token/refresh/", { refresh: refreshToken });
      const { access } = res.data;
      localStorage.setItem("access_token", access);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
    } catch (err) {
      console.error("❌ Erro ao renovar token:", err);
      logout();
    }
  };

  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        try {
          await fetchUser();
        } catch {
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    init();
  }, []);

  // 🔄 Renovação automática do token
  useEffect(() => {
    let interval;
    if (accessToken && refreshToken) {
      interval = setInterval(() => {
        console.log("🔄 Tentando renovar token...");
        refreshAccessToken();
      }, 25 * 60 * 1000); // 25 minutos (antes de expirar)
    }
    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);

  return { user, login, logout, loading, refreshAccessToken };
}
