import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DatasetList from "./components/DatasetList";
import Login from "./components/Login";

function App() {
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAutenticado(true);
  }, []);

  return (
    <>
      {autenticado ? (
        <DatasetList />
      ) : (
        <Login onLoginSuccess={() => setAutenticado(true)} />
      )}
    </>
  );
}

export default App;
