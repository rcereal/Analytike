import React, { useState } from "react";
import axios from "axios";

const DatasetUpload = () => {
  const [arquivo, setArquivo] = useState(null);
  const [nome, setNome] = useState("");

  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("nome", nome);

    axios
      .post("http://localhost:8000/api/upload-csv/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setNome("");
        setArquivo(null);
        alert("Arquivo enviado com sucesso!");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Erro ao enviar arquivo:", err);
        alert("Falha no envio.");
      });
  };
  return (
    <form onSubmit={handleUpload} className="mb-4">
      <div className="mb-3">
        <label className="form-label">Arquivo CSV: </label>
        <input
          type="file"
          className="form-control"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files[0];
            setArquivo(file);
            setNome(file.name);
          }}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Nome do Dataset: </label>
        <input
          type="text"
          className="form-control"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Enviar
      </button>
    </form>
  );
};

export default DatasetUpload;
