import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DatasetList from "./components/DatasetList";
import DatasetUpload from "./components/DatasetUpload";

function App() {
  return (
    <div className="container mt-5">
      <h1>Visualização de Datasets</h1>
      <hr />
      <h2>Enviar novo Dataset</h2>
      <DatasetUpload /> {/* componente separado de envio */}
      <DatasetList /> {/* componente separado de listagem*/}
    </div>
  );
}

export default App;
