import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DatasetList from "./components/DatasetList";
import Login from "./components/Login";
import api from "./services/axiosConfig";

function App() {
  const [autenticado, setAutenticado] = useState(null);

  useEffect(() => {
    const verificarSessao = async () => {
      try {
        await api.get("csrf/");
        const response = await api.get("verificar-sessao/");
        setAutenticado(response.data.autenticado);
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setAutenticado(false);
      }
    };

    verificarSessao();

    // Revalida a sessão a cada 5 minutos
    const interval = setInterval(verificarSessao, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (autenticado === null) {
    return <p className="text-center mt-5">🔄 Verificando sessão...</p>;
  }

  return (
    <>
      {autenticado ? (
        <DatasetList onLogout={() => setAutenticado(false)} />
      ) : (
        <Login onLoginSuccess={() => setAutenticado(true)} />
      )}
    </>
  );
}

export default App;
