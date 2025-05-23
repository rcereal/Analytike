import React, { useState, useEffect } from "react";
import api from "../services/axiosConfig";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Garante que o CSRF cookie seja carregado no início
    api.get("csrf/");
  }, []);

  const autenticar = async () => {
    try {
      const response = await api.post("login/", { username, password });
      alert("✅ Login realizado!");
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
