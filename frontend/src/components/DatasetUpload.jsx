import React, { useState } from "react";
import api from "../services/axiosConfig";

// Adicionamos a propriedade onUploadSuccess para atualizar a lista sem recarregar a página
const DatasetUpload = ({ onUploadSuccess }) => {
  const [arquivo, setArquivo] = useState(null);
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false); // Estado para feedback de carregamento

  const handleUpload = (e) => {
    e.preventDefault();
    setEnviando(true); // Inicia o feedback de envio

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("nome", nome);

    api
      .post("upload-csv/", formData, {
        // ✅ URL CORRIGIDA (relativa)
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("Arquivo enviado com sucesso!");
        setNome("");
        setArquivo(null);
        // Reseta o campo de arquivo no formulário
        document.querySelector('input[type="file"]').value = "";

        if (onUploadSuccess) {
          onUploadSuccess(); // ✅ Avisa o componente pai para recarregar a lista
        }
      })
      .catch((err) => {
        console.error("Erro ao enviar arquivo:", err);
        alert("Falha no envio.");
      })
      .finally(() => {
        setEnviando(false); // Finaliza o feedback de envio
      });
  };

  return (
    <form onSubmit={handleUpload} className="mb-4">
      <div className="mb-3">
        <label className="form-label">Arquivo CSV:</label>
        <input
          type="file"
          className="form-control"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setArquivo(file);
              // Preenche o nome automaticamente, mas permite edição
              if (!nome) {
                setNome(file.name.replace(".csv", ""));
              }
            }
          }}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Nome do Dataset:</label>
        <input
          type="text"
          className="form-control"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};

export default DatasetUpload;
