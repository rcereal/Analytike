import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DatasetList from "./components/DatasetList";
import DatasetUpload from "./components/DatasetUpload";

function App() {
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/teste/")
      .then((res) => setMensagem(res.data.mensagem))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container mt-5">
      <h1>Teste da API Django</h1>
      <p>{mensagem}</p>
      <hr />
      <h2>Enviar novo Dataset</h2>
      <DatasetUpload /> {/* componente separado de envio */}
      <DatasetList /> {/* componente separado de listagem*/}
    </div>
  );
}

export default App;
