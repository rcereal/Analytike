import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DatasetList from "./components/DatasetList";
import Login from "./components/Login";
import axios from "axios";

function App() {
  const [autenticado, setAutenticado] = useState(null);

  useEffect(() => {
    const verificarSessao = async () => {
      try {
        await axios.get("http://localhost:8000/api/csrf/", {
          withCredentials: true,
        });

        const response = await axios.get(
          "http://localhost:8000/api/verificar-sessao/",
          { withCredentials: true }
        );

        console.log("Resposta da verificação de sessão:", response.data);

        if (response.data.autenticado) {
          setAutenticado(true);
        } else {
          setAutenticado(false);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setAutenticado(false);
      }
    };

    verificarSessao();
  }, []);

  if (autenticado === null) {
    return <p className="text-center mt-5">🔄 Verificando sessão...</p>; // ou um loader
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
