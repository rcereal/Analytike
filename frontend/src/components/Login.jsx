import React, { useState, useEffect } from "react";
import api from "../services/axiosConfig";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // 🔑 carrega o CSRF assim que a tela abrir
    api.get("csrf/");
  }, []);

  const autenticar = async (e) => {
    e.preventDefault();
    try {
      // 🔑 login enviando cookies e CSRF
      await api.post("login/", { username, password });

      console.log("✅ Login realizado com sucesso!");

      // 🔑 verifica se a sessão persistiu no backend
      const response = await api.get("verificar-sessao/");
      if (response.data.autenticado) {
        onLoginSuccess();
      } else {
        console.error("❌ Sessão não persistiu no backend.");
      }
    } catch (error) {
      alert("❌ Usuário ou senha inválidos");
      console.error("Erro ao autenticar:", error);
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
