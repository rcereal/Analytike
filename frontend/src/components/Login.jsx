// import React, { useState } from "react";
// import api from "../services/axiosConfig";

// const Login = ({ onLoginSuccess }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const autenticar = async (e) => {
//     e.preventDefault();
//     try {
//       // 🔑 Faz login no endpoint do JWT
//       const response = await api.post("token/", { username, password });

//       // Salva tokens no localStorage
//       localStorage.setItem("access_token", response.data.access);
//       localStorage.setItem("refresh_token", response.data.refresh);

//       console.log("✅ Login realizado com sucesso!");
//       onLoginSuccess();
//     } catch (error) {
//       alert("❌ Usuário ou senha inválidos");
//       console.error("Erro ao autenticar:", error);
//     }
//   };

//   return (
//     <div className="container mt-5" style={{ maxWidth: "400px" }}>
//       <h3 className="mb-4">Login</h3>
//       <form onSubmit={autenticar}>
//         <input
//           type="text"
//           placeholder="Usuário"
//           className="form-control mb-3"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Senha"
//           className="form-control mb-3"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button type="submit" className="btn btn-primary w-100">
//           Entrar
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const autenticar = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      onLoginSuccess();
    } else {
      alert("❌ Usuário ou senha inválidos");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="mb-4">Login</h3>
      <form onSubmit={autenticar}>
        <input
          type="text"
          placeholder="Usuário"
          className="form-control mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary w-100">
          Entrar
        </button>
      </form>
    </div>
  );
};

export default Login;
