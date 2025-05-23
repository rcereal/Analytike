import React, { useState, useEffect } from "react"; // <== aqui está o que faltava
import axios from "axios";

// Configuração global do axios
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/api/csrf/");
  }, []);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  const autenticar = async () => {
    try {
      const csrfToken = getCookie("csrftoken");

      const response = await axios.post(
        "http://localhost:8000/api/login/",
        { username, password },
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      );

      alert("✅ Login realizado!");
      localStorage.setItem("token", "logado");
      onLoginSuccess();
    } catch (error) {
      alert("❌ Usuário ou senha inválidos");
      console.error("Erro ao autenticar:", error);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="mb-4">Login</h3>
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
      <button className="btn btn-primary w-100" onClick={autenticar}>
        Entrar
      </button>
    </div>
  );
};

export default Login;
